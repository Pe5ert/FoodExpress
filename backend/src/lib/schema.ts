// @ts-nocheck
import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from './db'
import { hashSenha, verificarSenha } from './password'

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

export async function ensureEnderecosClientesTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS enderecos_clientes (
      id VARCHAR(191) NOT NULL,
      cliente_id VARCHAR(191) NOT NULL,
      label VARCHAR(80) NOT NULL,
      endereco TEXT NOT NULL,
      principal TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_enderecos_cliente (cliente_id),
      KEY idx_enderecos_principal (cliente_id, principal),
      CONSTRAINT fk_enderecos_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

function splitSqlStatements(schema: string) {
  const statements: string[] = []
  let current = ''
  let state: 'normal' | 'line-comment' | 'block-comment' | 'string' = 'normal'
  let quoteChar = ''

  for (let i = 0; i < schema.length; i++) {
    const char = schema[i]
    const next = schema[i + 1]

    if (state === 'line-comment') {
      current += char
      if (char === '\n') state = 'normal'
      continue
    }

    if (state === 'block-comment') {
      current += char
      if (char === '*' && next === '/') {
        current += next
        i++
        state = 'normal'
      }
      continue
    }

    if (state === 'string') {
      current += char
      if (char === quoteChar) {
        if (quoteChar === '\'' && next === '\'') {
          current += next
          i++
        } else {
          state = 'normal'
          quoteChar = ''
        }
      }
      continue
    }

    if (char === '-' && next === '-') {
      current += char + next
      i++
      state = 'line-comment'
      continue
    }

    if (char === '/' && next === '*') {
      current += char + next
      i++
      state = 'block-comment'
      continue
    }

    if (char === '\'' || char === '"' || char === '`') {
      current += char
      state = 'string'
      quoteChar = char
      continue
    }

    if (char === ';') {
      const statement = current.trim()
      if (statement) statements.push(statement)
      current = ''
      continue
    }

    current += char
  }

  const tail = current.trim()
  if (tail) statements.push(tail)

  return statements
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

  const statements = splitSqlStatements(schema)
    .map(s => s.trim())
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

async function garantirAdministradorPrincipal() {
  const email = normalizarEmail(process.env.ADMIN_EMAIL)
  const senha = String(process.env.ADMIN_PASSWORD || '')
  if (!email || !senha) return

  const nome = String(process.env.ADMIN_NAME || 'Administrador FoodExpress').trim()
  const existente = await db.execute({
    sql: 'SELECT id, senha_hash FROM operadores WHERE lower(email) = ? LIMIT 1',
    args: [email],
  })

  if (existente.rows.length) {
    const operador = existente.rows[0] as any
    const senhaHash = verificarSenha(senha, operador.senha_hash) ? operador.senha_hash : hashSenha(senha)
    await db.execute({
      sql: `UPDATE operadores
            SET nome = ?, senha_hash = ?, status = 'ativo'
            WHERE id = ?`,
      args: [nome, senhaHash, operador.id],
    })
    return
  }

  const id = `op_admin_${idEstavel(email)}`
  await db.execute({
    sql: `INSERT INTO operadores
          (id, user_id, nome, email, telefone, turno, status, senha_hash)
          VALUES (?, ?, ?, ?, '', 'integral', 'ativo', ?)`,
    args: [id, id, nome, email, hashSenha(senha)],
  })
  console.log(`✅ Administrador principal configurado: ${email}`)
}

export async function ensureDatabaseHealth() {
  if (schemaPromise) return schemaPromise
  schemaPromise = (async () => {
    let attemptedApplySchema = false
    async function doValidation() {
      await aplicarSchemaMysql()

      await ensureColumn('restaurantes', 'user_id', 'VARCHAR(191)')
      await ensureColumn('restaurantes', 'horario_abertura', 'VARCHAR(10)')
      await ensureColumn('restaurantes', 'horario_fechamento', 'VARCHAR(10)')
      await ensureColumn('restaurantes', 'dias_aberto', 'TEXT')
      await ensureColumn('restaurantes', 'formas_pagamento', 'TEXT')
      await ensureColumn('restaurantes', 'logo', 'TEXT')
      await ensureColumn('restaurantes', 'capa', 'TEXT')
      await ensureColumn('restaurantes', 'promo', 'VARCHAR(120)')
      await ensureColumn('restaurantes', 'motivo_rejeicao', 'TEXT')
      await ensureColumn('restaurantes', 'senha_hash', 'TEXT')
      await ensureColumn('restaurantes', 'avaliacao_media', 'DOUBLE DEFAULT 0')
      await ensureColumn('restaurantes', 'pedido_minimo', 'DOUBLE DEFAULT 0')

      await ensureColumn('clientes', 'senha_hash', 'TEXT')
      await ensureColumn('clientes', 'deletado_em', 'DATETIME')
      await ensureColumn('clientes', 'endereco_label', 'VARCHAR(80)')
      await ensureEnderecosClientesTable()
      await ensureColumn('gerentes', 'senha_hash', 'TEXT')
      await ensureColumn('operadores', 'senha_hash', 'TEXT')
      await ensureColumn('entregadores', 'saldo_disponivel', 'DOUBLE DEFAULT 0')
      await ensureColumn('entregadores', 'saldo_total', 'DOUBLE DEFAULT 0')
      await ensureColumn('entregadores', 'senha_hash', 'TEXT')
      await ensureColumn('cardapio', 'imagem', 'TEXT')
      await ensureColumn('cardapio', 'serve_pessoas', 'INT DEFAULT 1')
      await ensureColumn('cardapio', 'preco_original', 'DOUBLE')
      await ensureColumn('cardapio', 'promocao_ativa', 'TINYINT(1) DEFAULT 0')
      await ensureColumn('cardapio', 'promocao_tipo', 'VARCHAR(50)')
      await ensureColumn('cardapio', 'promocao_label', 'VARCHAR(120)')
      await ensureColumn('cardapio', 'combo_itens', 'LONGTEXT')
      await ensureColumn('pedidos', 'desconto', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'troco', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      await ensureColumn('pedidos', 'ganho_entregador', 'DOUBLE DEFAULT 0')
      await ensureColumn('pedidos', 'repasse_entregador_status', "VARCHAR(50) DEFAULT 'pendente'")
      await ensureColumn('pedidos', 'repasse_entregador_em', 'DATETIME')
      await ensureColumn('pedidos', 'oferta_entregador_id', 'VARCHAR(191)')
      await ensureColumn('pedidos', 'oferta_enviada_em', 'DATETIME')
      await ensureColumn('pedidos', 'oferta_expira_em', 'DATETIME')
      await ensureColumn('pedidos', 'coletado_em', 'DATETIME')
      await db.execute(`
        CREATE TABLE IF NOT EXISTS cupom_usos (
          id VARCHAR(191) NOT NULL,
          cupom_codigo VARCHAR(100) NOT NULL,
          cliente_id VARCHAR(191) NOT NULL,
          pedido_id VARCHAR(191) NOT NULL,
          usado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_cupom_usos_cliente_codigo (cliente_id, cupom_codigo),
          KEY idx_cupom_usos_codigo (cupom_codigo),
          KEY idx_cupom_usos_pedido (pedido_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      await ensureColumn('tickets', 'resposta', 'TEXT')
      await ensureColumn('tickets', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      await ensureColumn('tickets', 'solicitante_id', 'VARCHAR(191)')
      await ensureColumn('tickets', 'solicitante_tipo', 'VARCHAR(50)')
      await ensureColumn('tickets', 'solicitante_nome', 'VARCHAR(255)')
      await ensureColumn('tickets', 'solicitante_email', 'VARCHAR(255)')
      await db.execute('ALTER TABLE tickets MODIFY cliente_id VARCHAR(191) NULL')

      await db.execute(`
        CREATE TABLE IF NOT EXISTS ofertas_entrega (
          id VARCHAR(191) NOT NULL,
          pedido_id VARCHAR(191) NOT NULL,
          entregador_id VARCHAR(191) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'ofertada',
          expira_em DATETIME NOT NULL,
          respondida_em DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_ofertas_pedido (pedido_id),
          KEY idx_ofertas_entregador (entregador_id),
          KEY idx_ofertas_status_expira (status, expira_em),
          UNIQUE KEY uq_oferta_pedido_entregador (pedido_id, entregador_id),
          CONSTRAINT fk_ofertas_pedido
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_ofertas_entregador
            FOREIGN KEY (entregador_id) REFERENCES entregadores(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)

      await garantirAdministradorPrincipal()
      console.log('✅ Estrutura do banco validada sem popular dados')
    }

    try {
      await doValidation()
    } catch (error: any) {
      // Se a validação falhar por tabela inexistente, tente aplicar o schema.sql explicitamente
      const message = String(error?.message || '').toLowerCase()
      const code = String(error?.code || '')
      if (!attemptedApplySchema && (message.includes("doesn't exist") || message.includes('no such table') || code === 'ER_NO_SUCH_TABLE')) {
        attemptedApplySchema = true
        try {
          console.warn('Tabela ausente detectada — aplicando schema.sql novamente e revalida...')
          await aplicarSchemaMysql()
          await doValidation()
        } catch (e) {
          console.error('⚠️ Falha ao aplicar schema após detecção de tabela ausente:', e?.message || e)
          throw e
        }
      } else {
        console.error('⚠️ Falha ao validar schema automaticamente:', error.message)
        throw error
      }
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
