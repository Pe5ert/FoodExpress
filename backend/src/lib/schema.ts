// @ts-nocheck
import { db } from './db'
import { hashSenha } from './password'
import { readFileSync } from 'fs'
import { join } from 'path'

let schemaPromise: Promise<void> | null = null

async function ensureColumn(table: string, column: string, definition: string) {
  const info = await db.execute(`PRAGMA table_info(${table})`)
  const exists = info.rows.some((row: any) => row.name === column)
  if (!exists) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    console.log(`➕ Coluna criada: ${table}.${column}`)
  }
}

function normalizarEmail(email?: string) {
  return String(email || '').trim().toLowerCase()
}

function idEstavel(valor: string) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'principal'
}

async function aplicarSchemaBase() {
  const candidatePaths = [
    join(process.cwd(), '../database/schema.sql'),
    join(process.cwd(), 'database/schema.sql'),
    join(process.cwd(), '../schema.sql'),
    join(process.cwd(), 'schema.sql'),
  ]

  let schema = ''
  for (const path of candidatePaths) {
    try {
      schema = readFileSync(path, 'utf-8')
      break
    } catch {}
  }
  if (!schema) return

  const statements = schema
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 10)

  for (const stmt of statements) {
    try {
      await db.execute(stmt)
    } catch (e: any) {
      const message = String(e?.message || '').toLowerCase()
      if (!message.includes('already exists') && !message.includes('duplicate')) {
        throw e
      }
    }
  }
}

export async function ensureDatabaseHealth() {
  return
}

export async function vincularRestauranteAoUsuario(restauranteId: string, userId?: string, email?: string, nome?: string) {
  if (!restauranteId || !userId) return

  const gerenteId = `ger_${userId}`

  await db.execute({
    sql: `UPDATE restaurantes
          SET user_id = COALESCE(NULLIF(user_id, ''), ?),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [userId, restauranteId]
  })

  const rest = await db.execute({
    sql: 'SELECT nome, email, telefone FROM restaurantes WHERE id = ? LIMIT 1',
    args: [restauranteId]
  })
  const r = rest.rows[0] as any || {}

  const gerenteEmail = normalizarEmail(email) || normalizarEmail(r.email) || `${userId}@local.dev`
  const gerenteNome = nome || r.nome || 'Gerente'
  const gerenteTelefone = r.telefone || ''

  // A tabela gerentes tem UNIQUE(user_id) e UNIQUE(email). Em bancos já usados,
  // pode existir uma linha com o user_id e outra com o mesmo email. Antes o INSERT
  // só tratava conflito pelo id e derrubava o backend com SQLITE_CONSTRAINT.
  const candidatos = await db.execute({
    sql: `SELECT id, user_id, email
          FROM gerentes
          WHERE id = ? OR user_id = ? OR lower(email) = ?`,
    args: [gerenteId, userId, gerenteEmail]
  })

  const linhas = candidatos.rows as any[]
  let manterId = gerenteId
  const porId = linhas.find(g => g.id === gerenteId)
  const porUser = linhas.find(g => g.user_id === userId)
  const porEmail = linhas.find(g => normalizarEmail(g.email) === gerenteEmail)
  if (porId?.id) manterId = porId.id
  else if (porUser?.id) manterId = porUser.id
  else if (porEmail?.id) manterId = porEmail.id

  // Remove duplicatas de vínculo do mesmo usuário/email para não bater nos UNIQUE.
  for (const g of linhas) {
    if (g.id !== manterId) {
      await db.execute({ sql: 'DELETE FROM gerentes WHERE id = ?', args: [g.id] })
    }
  }

  const existente = await db.execute({ sql: 'SELECT id FROM gerentes WHERE id = ? LIMIT 1', args: [manterId] })
  if (existente.rows.length) {
    await db.execute({
      sql: `UPDATE gerentes
            SET user_id = ?,
                nome = ?,
                email = ?,
                telefone = ?,
                cargo = 'gerente',
                restaurante_id = ?,
                permissoes = 'admin',
                status = 'ativo'
            WHERE id = ?`,
      args: [userId, gerenteNome, gerenteEmail, gerenteTelefone, restauranteId, manterId]
    })
    return
  }

  await db.execute({
    sql: `INSERT INTO gerentes (id, user_id, nome, email, telefone, cargo, restaurante_id, permissoes, status)
          VALUES (?, ?, ?, ?, ?, 'gerente', ?, 'admin', 'ativo')`,
    args: [gerenteId, userId, gerenteNome, gerenteEmail, gerenteTelefone, restauranteId]
  })
}

export async function buscarRestauranteDoUsuario(userId?: string, email?: string, nome?: string) {
  const emailNormalizado = normalizarEmail(email)

  // Primeiro tenta pelo e-mail do usuário. Isso recupera lojas criadas antes da
  // troca do ID local de Date.now() para ID estável por e-mail, sem mostrar loja de terceiros.
  if (emailNormalizado) {
    const porGerente = await db.execute({
      sql: `SELECT r.*
            FROM restaurantes r
            INNER JOIN gerentes g ON g.restaurante_id = r.id
            WHERE lower(g.email) = ?
            ORDER BY r.updated_at DESC, r.created_at DESC
            LIMIT 1`,
      args: [emailNormalizado]
    })
    if (porGerente.rows.length) {
      const rest = porGerente.rows[0] as any
      await vincularRestauranteAoUsuario(rest.id, userId, emailNormalizado, nome)
      return rest
    }

    const porEmailLoja = await db.execute({
      sql: `SELECT * FROM restaurantes WHERE lower(email) = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1`,
      args: [emailNormalizado]
    })
    if (porEmailLoja.rows.length) {
      const rest = porEmailLoja.rows[0] as any
      await vincularRestauranteAoUsuario(rest.id, userId, emailNormalizado, nome)
      return rest
    }
  }

  if (userId) {
    const queries = [
      { sql: `SELECT r.* FROM restaurantes r INNER JOIN gerentes g ON g.restaurante_id = r.id WHERE g.user_id = ? LIMIT 1`, args: [userId] },
      { sql: `SELECT * FROM restaurantes WHERE user_id = ? LIMIT 1`, args: [userId] },
      { sql: `SELECT * FROM restaurantes WHERE id = ? LIMIT 1`, args: [`rest_${userId}`] },
      { sql: `SELECT * FROM restaurantes WHERE id LIKE ? ORDER BY created_at DESC LIMIT 1`, args: [`rest_${userId}%`] },
    ]

    for (const query of queries) {
      const result = await db.execute(query)
      if (result.rows.length) {
        const rest = result.rows[0] as any
        await vincularRestauranteAoUsuario(rest.id, userId, emailNormalizado, nome)
        return rest
      }
    }
  }

  return null
}
