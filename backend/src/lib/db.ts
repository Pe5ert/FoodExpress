import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'foodexpress',
  waitForConnections: true,
  connectionLimit: 10,
})

export const db = {
  execute: async (query: { sql: string; args?: any[] } | string) => {
    const sql  = typeof query === 'string' ? query : query.sql
    const args = typeof query === 'string' ? [] : (query.args ?? [])
    const [rows] = await pool.execute(sql, args)
    return { rows: rows as any[] }
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
