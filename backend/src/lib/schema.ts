// @ts-nocheck
import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from './db'
import { hashSenha } from './password'

let schemaPromise: Promise<void> | null = null

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

async function ensureColumn(table: string, column: string, definition: string) {
  const result = await db.execute({
    sql: `SELECT COUNT(*) AS total
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND COLUMN_NAME = ?`,
    args: [table, column]
  })
  const exists = Number((result.rows[0] as any)?.total || 0) > 0
  if (!exists) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    console.log(`➕ Coluna criada: ${table}.${column}`)
  }
}

async function aplicarSchemaMysql() {
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
    .filter(s => s.length > 4)

  for (const stmt of statements) {
    try {
      await db.execute(stmt)
    } catch (e: any) {
      const message = String(e?.message || '').toLowerCase()
      const code = String(e?.code || '')
      if (
        !message.includes('duplicate') &&
        !message.includes('already exists') &&
        code !== 'ER_DUP_KEYNAME'
      ) {
        throw e
      }
    }
  }
}

export async function ensureDatabaseHealth() {
  if (schemaPromise) return schemaPromise

  schemaPromise = (async () => {
    try {
      await aplicarSchemaMysql()

      await ensureColumn('restaurantes', 'user_id', 'VARCHAR(191)')
      await ensureColumn('restaurantes', 'horario_abertura', 'VARCHAR(10)')
      await ensureColumn('restaurantes', 'horario_fechamento', 'VARCHAR(10)')
      await ensureColumn('restaurantes', 'dias_aberto', 'TEXT')
      await ensureColumn('restaurantes', 'formas_pagamento', 'TEXT')
      await ensureColumn('restaurantes', 'logo', 'TEXT')
      await ensureColumn('restaurantes', 'capa', 'TEXT')
      await ensureColumn('restaurantes', 'motivo_rejeicao', 'TEXT')
      await ensureColumn('restaurantes', 'senha_hash', 'TEXT')
      await ensureColumn('restaurantes', 'avaliacao_media', 'DOUBLE DEFAULT 0')

      await ensureColumn('clientes', 'senha_hash', 'TEXT')
      await ensureColumn('clientes', 'deletado_em', 'DATETIME')
      await ensureColumn('gerentes', 'senha_hash', 'TEXT')
      await ensureColumn('operadores', 'senha_hash', 'TEXT')
      await ensureColumn('entregadores', 'saldo_disponivel', 'DOUBLE DEFAULT 0')
      await ensureColumn('entregadores', 'saldo_total', 'DOUBLE DEFAULT 0')
      await ensureColumn('entregadores', 'senha_hash', 'TEXT')
      await ensureColumn('cardapio', 'imagem', 'TEXT')
      await ensureColumn('pedidos', 'desconto', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'troco', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      await ensureColumn('pedidos', 'ganho_entregador', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'repasse_entregador_status', "VARCHAR(50) DEFAULT 'pendente'")
      await ensureColumn('pedidos', 'repasse_entregador_em', 'DATETIME')
      await ensureColumn('tickets', 'resposta', 'TEXT')
      await ensureColumn('tickets', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP')

      await db.execute("UPDATE restaurantes SET status = 'ativo' WHERE status IS NULL OR status = ''")
      await db.execute("UPDATE restaurantes SET user_id = SUBSTRING(id, 6) WHERE (user_id IS NULL OR user_id = '') AND id LIKE 'rest_%'")
      await db.execute("UPDATE entregadores SET cpf = CONCAT('AUTO-', user_id) WHERE cpf = '000.000.000-00' AND user_id IS NOT NULL AND user_id != ''")

      const operadorEmail = normalizarEmail(process.env.OPERATOR_EMAIL || process.env.OPERADOR_EMAIL)
      if (operadorEmail) {
        const operadorBaseId = idEstavel(operadorEmail)
        const operadorSenhaHash = process.env.OPERATOR_PASSWORD || process.env.OPERADOR_SENHA
          ? hashSenha(String(process.env.OPERATOR_PASSWORD || process.env.OPERADOR_SENHA))
          : null
        await db.execute({
          sql: `INSERT INTO operadores (id, user_id, nome, email, telefone, turno, status, senha_hash)
                VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?)
                ON DUPLICATE KEY UPDATE
                  nome = VALUES(nome),
                  telefone = COALESCE(NULLIF(VALUES(telefone), ''), telefone),
                  senha_hash = COALESCE(VALUES(senha_hash), senha_hash),
                  status = 'ativo'`,
          args: [
            `op_${operadorBaseId}`,
            `op_${operadorBaseId}`,
            process.env.OPERATOR_NAME || process.env.OPERADOR_NOME || 'Operador FoodExpress',
            operadorEmail,
            process.env.OPERATOR_PHONE || process.env.OPERADOR_TELEFONE || '',
            process.env.OPERATOR_SHIFT || process.env.OPERADOR_TURNO || 'geral',
            operadorSenhaHash,
          ]
        })
      }

      await db.execute(`INSERT IGNORE INTO gerentes
        (id, user_id, nome, email, telefone, cargo, restaurante_id, permissoes, status)
        SELECT
          CONCAT('ger_', r.user_id),
          r.user_id,
          COALESCE(NULLIF(r.nome, ''), 'Gerente'),
          COALESCE(NULLIF(r.email, ''), CONCAT(r.user_id, '@local.dev')),
          COALESCE(r.telefone, ''),
          'gerente',
          r.id,
          'admin',
          'ativo'
        FROM restaurantes r
        WHERE r.user_id IS NOT NULL AND r.user_id != ''`)
    } catch (error: any) {
      console.error('⚠️ Falha ao validar schema automaticamente:', error.message)
      throw error
    }
  })()

  try {
    await schemaPromise
  } catch (error) {
    schemaPromise = null
    throw error
  }
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
  await ensureDatabaseHealth()
  const emailNormalizado = normalizarEmail(email)

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
