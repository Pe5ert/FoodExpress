import { config } from 'dotenv'
import { db } from '../src/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

config()

async function ensureColumn(table: string, column: string, definition: string) {
  try {
    const info = await db.execute(`PRAGMA table_info(${table})`)
    const exists = info.rows.some((row: any) => row.name === column)
    if (!exists) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
      console.log(`  ➕ Coluna criada: ${table}.${column}`)
    }
  } catch (e: any) {
    console.error(`  ⚠️  Coluna ${table}.${column}:`, e.message)
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

async function migrate() {
  console.log('🗄️  Executando migrations...')

  try {
    await db.execute('SELECT 1')
    console.log('✅ Conexão com banco OK')
  } catch (e: any) {
    console.error('\n❌ Erro de conexão com o banco de dados!')
    console.error('   Verifique as variáveis no arquivo backend/.env:')
    console.error('   TURSO_DATABASE_URL=libsql://seu-banco.turso.io')
    console.error('   TURSO_AUTH_TOKEN=seu_token\n')
    console.error('   Detalhes:', e.message)
    process.exit(1)
  }

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
      console.log(`📄 schema.sql encontrado: ${path}`)
      break
    } catch {}
  }

  if (!schema) {
    console.error('❌ schema.sql não encontrado.')
    process.exit(1)
  }

  const statements = schema
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 10)

  let ok = 0, skip = 0, fail = 0
  for (const stmt of statements) {
    try {
      await db.execute(stmt)
      ok++
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        skip++
      } else {
        console.error(`  ⚠️  ${stmt.substring(0, 70)}... → ${e.message}`)
        fail++
      }
    }
  }
  console.log(`✅ Schema: ${ok} criados, ${skip} já existentes, ${fail} erros`)

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
  await ensureColumn('pedidos', 'avaliacao_restaurante', 'INTEGER')
  await ensureColumn('pedidos', 'avaliacao_entregador', 'INTEGER')
  await ensureColumn('pedidos', 'comentario', 'TEXT')
  await ensureColumn('pedidos', 'updated_at', 'DATETIME')
  await ensureColumn('pedidos', 'ganho_entregador', 'REAL DEFAULT 0')
  await ensureColumn('pedidos', 'repasse_entregador_status', "TEXT DEFAULT 'pendente'")
  await ensureColumn('pedidos', 'repasse_entregador_em', 'DATETIME')
  await ensureColumn('entregadores', 'saldo_disponivel', 'REAL DEFAULT 0')
  await ensureColumn('entregadores', 'saldo_total', 'REAL DEFAULT 0')

  await db.execute(`CREATE TABLE IF NOT EXISTS operadores (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    turno TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  const operadorEmail = normalizarEmail(process.env.OPERATOR_EMAIL || process.env.OPERADOR_EMAIL)
  if (operadorEmail) {
    const operadorBaseId = idEstavel(operadorEmail)
    await db.execute({
      sql: `INSERT INTO operadores (id, user_id, nome, email, telefone, turno, status)
            VALUES (?, ?, ?, ?, ?, ?, 'ativo')
            ON CONFLICT(email) DO UPDATE SET
              nome = excluded.nome,
              telefone = COALESCE(NULLIF(excluded.telefone, ''), operadores.telefone),
              status = 'ativo'`,
      args: [
        `op_${operadorBaseId}`,
        `op_${operadorBaseId}`,
        process.env.OPERATOR_NAME || process.env.OPERADOR_NOME || 'Operador FoodExpress',
        operadorEmail,
        process.env.OPERATOR_PHONE || process.env.OPERADOR_TELEFONE || '',
        process.env.OPERATOR_SHIFT || process.env.OPERADOR_TURNO || 'geral',
      ]
    })
    console.log(`  ✅ Operador ativo garantido: ${operadorEmail}`)
  }

  const extras = [
    `CREATE TABLE IF NOT EXISTS cupons (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      desconto REAL NOT NULL,
      tipo TEXT NOT NULL,
      minimo REAL DEFAULT 0,
      data_expiracao DATETIME,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS avaliacoes (
      id TEXT PRIMARY KEY,
      cliente_id TEXT NOT NULL,
      pedido_id TEXT,
      restaurante_id TEXT,
      entregador_id TEXT,
      estrelas INTEGER NOT NULL,
      comentario TEXT,
      tipo TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS usuarios_pendentes (
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
    )`,
  ]

  for (const stmt of extras) {
    try {
      await db.execute(stmt)
    } catch (e: any) {
      if (!e.message?.includes('already exists')) {
        console.error('  ⚠️  Tabela extra:', e.message)
      }
    }
  }

  await ensureColumn('avaliacoes', 'cliente_id', 'TEXT')
  await ensureColumn('avaliacoes', 'pedido_id', 'TEXT')
  await ensureColumn('avaliacoes', 'restaurante_id', 'TEXT')
  await ensureColumn('avaliacoes', 'entregador_id', 'TEXT')
  await ensureColumn('avaliacoes', 'estrelas', 'INTEGER')
  await ensureColumn('avaliacoes', 'comentario', 'TEXT')
  await ensureColumn('avaliacoes', 'tipo', "TEXT DEFAULT 'restaurante'")
  await ensureColumn('avaliacoes', 'created_at', 'DATETIME')
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

  console.log('🎉 Migrations concluídas!')
}

migrate().catch(e => {
  console.error('Erro fatal:', e.message)
  process.exit(1)
})
