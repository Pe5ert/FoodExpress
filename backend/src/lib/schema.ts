// @ts-nocheck
import { db } from './db'

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

export async function ensureDatabaseHealth() {
  if (schemaPromise) return schemaPromise

  schemaPromise = (async () => {
    try {
      await ensureColumn('restaurantes', 'user_id', 'TEXT')
      await ensureColumn('restaurantes', 'horario_abertura', 'TEXT')
      await ensureColumn('restaurantes', 'horario_fechamento', 'TEXT')
      await ensureColumn('restaurantes', 'dias_aberto', 'TEXT')
      await ensureColumn('restaurantes', 'formas_pagamento', 'TEXT')
      await ensureColumn('restaurantes', 'logo', 'TEXT')
      await ensureColumn('restaurantes', 'capa', 'TEXT')
      await ensureColumn('restaurantes', 'motivo_rejeicao', 'TEXT')

      await ensureColumn('cardapio', 'imagem', 'TEXT')
      await ensureColumn('pedidos', 'desconto', 'REAL DEFAULT 0')
      await ensureColumn('pedidos', 'troco', 'REAL DEFAULT 0')
      await ensureColumn('pedidos', 'avaliacao_restaurante', 'INTEGER')
      await ensureColumn('pedidos', 'avaliacao_entregador', 'INTEGER')
      await ensureColumn('pedidos', 'comentario', 'TEXT')
      await ensureColumn('pedidos', 'updated_at', 'DATETIME')

      // Tabela de clientes - colunas adicionais
      await ensureColumn('clientes', 'deletado_em', 'DATETIME')

      await db.execute(`CREATE TABLE IF NOT EXISTS avaliacoes (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        pedido_id TEXT,
        restaurante_id TEXT,
        entregador_id TEXT,
        estrelas INTEGER NOT NULL,
        comentario TEXT,
        tipo TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      await ensureColumn('avaliacoes', 'cliente_id', 'TEXT')
      await ensureColumn('avaliacoes', 'pedido_id', 'TEXT')
      await ensureColumn('avaliacoes', 'restaurante_id', 'TEXT')
      await ensureColumn('avaliacoes', 'entregador_id', 'TEXT')
      await ensureColumn('avaliacoes', 'estrelas', 'INTEGER')
      await ensureColumn('avaliacoes', 'comentario', 'TEXT')
      await ensureColumn('avaliacoes', 'tipo', "TEXT DEFAULT 'restaurante'")
      await ensureColumn('avaliacoes', 'created_at', 'DATETIME')

      // Tabela de tickets - colunas adicionais
      await ensureColumn('tickets', 'resposta', 'TEXT')
      await ensureColumn('tickets', 'updated_at', 'DATETIME')

      await db.execute(`CREATE TABLE IF NOT EXISTS usuarios_pendentes (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        nome TEXT,
        telefone TEXT,
        token TEXT NOT NULL,
        codigo TEXT,
        tipo TEXT DEFAULT 'email',
        expira_em DATETIME NOT NULL,
        usado INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      await ensureColumn('usuarios_pendentes', 'email', 'TEXT')
      await ensureColumn('usuarios_pendentes', 'nome', 'TEXT')
      await ensureColumn('usuarios_pendentes', 'telefone', 'TEXT')
      await ensureColumn('usuarios_pendentes', 'token', 'TEXT')
      await ensureColumn('usuarios_pendentes', 'codigo', 'TEXT')
      await ensureColumn('usuarios_pendentes', 'tipo', "TEXT DEFAULT 'email'")
      await ensureColumn('usuarios_pendentes', 'expira_em', 'DATETIME')
      await ensureColumn('usuarios_pendentes', 'usado', 'INTEGER DEFAULT 0')
      await ensureColumn('usuarios_pendentes', 'criado_em', 'DATETIME DEFAULT CURRENT_TIMESTAMP')

      await db.execute("UPDATE restaurantes SET status = 'ativo' WHERE status IS NULL OR status = ''")
      await db.execute("UPDATE restaurantes SET user_id = substr(id, 6) WHERE (user_id IS NULL OR user_id = '') AND id LIKE 'rest_%'")
      await db.execute("UPDATE entregadores SET cpf = 'AUTO-' || user_id WHERE cpf = '000.000.000-00' AND user_id IS NOT NULL AND user_id != ''")

      await db.execute(`CREATE TABLE IF NOT EXISTS cupons (
        id TEXT PRIMARY KEY,
        codigo TEXT UNIQUE NOT NULL,
        desconto REAL NOT NULL,
        tipo TEXT NOT NULL,
        minimo REAL DEFAULT 0,
        data_expiracao DATETIME,
        ativo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      await db.execute(`INSERT OR IGNORE INTO gerentes
        (id, user_id, nome, email, telefone, cargo, restaurante_id, permissoes, status)
        SELECT
          'ger_' || r.user_id,
          r.user_id,
          COALESCE(NULLIF(r.nome, ''), 'Gerente'),
          COALESCE(NULLIF(r.email, ''), r.user_id || '@local.dev'),
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
  await ensureDatabaseHealth()
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
