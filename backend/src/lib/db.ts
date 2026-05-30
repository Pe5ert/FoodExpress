// @ts-nocheck
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'foodexpress',
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
