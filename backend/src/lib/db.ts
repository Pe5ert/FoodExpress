// @ts-nocheck
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

function configFromUrl(rawUrl?: string) {
  if (!rawUrl) return null
  try {
    const url = new URL(rawUrl)
    if (!['mysql:', 'mariadb:'].includes(url.protocol)) return null
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: decodeURIComponent(url.pathname.replace(/^\//, '') || ''),
    }
  } catch {
    return null
  }
}

const urlConfig = configFromUrl(
  process.env.MYSQL_URL ||
  process.env.MARIADB_URL ||
  process.env.DATABASE_URL ||
  process.env.DB_URL
)

const host = process.env.DB_HOST || process.env.MYSQLHOST || urlConfig?.host || 'localhost'
const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || urlConfig?.port || 3306)
const user = process.env.DB_USER || process.env.MYSQLUSER || urlConfig?.user || 'root'
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || urlConfig?.password || ''
const database = process.env.DB_NAME || process.env.MYSQLDATABASE || urlConfig?.database || 'foodexpress'

if (process.env.NODE_ENV === 'production' && host === 'localhost') {
  console.warn('⚠️ MariaDB configurado como localhost. No Railway, vincule as variáveis do banco ao serviço do backend.')
}

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
})

export const db = {
  execute: async (query: { sql: string; args?: any[] } | string) => {
    const sql = typeof query === 'string' ? query : query.sql
    const args = typeof query === 'string' ? [] : (query.args ?? [])
    const [result] = await pool.execute(sql, args)
    const rows = Array.isArray(result) ? result : []
    return {
      rows,
      rowsAffected: Number((result as any)?.affectedRows || 0),
      lastInsertRowid: (result as any)?.insertId,
      insertId: (result as any)?.insertId,
    }
  }
}

export async function query(sql: string, params?: any[]) {
  try {
    const result = await db.execute({ sql, args: params ?? [] })
    return result.rows
  } catch (error) {
    console.error('Erro no banco de dados:', error)
    throw error
  }
}
