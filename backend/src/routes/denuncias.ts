// @ts-nocheck
import { Router, Response } from 'express'
import crypto from 'crypto'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { buscarRestauranteDoUsuario, ensureDatabaseHealth } from '../lib/schema'

const router = Router()

function perfil(req: AuthRequest) {
  return String(req.userRole || '').toLowerCase()
}

function ehOperador(req: AuthRequest) {
  return perfil(req) === 'operador'
}

function limparTexto(valor: any, limite = 500) {
  return String(valor || '').trim().slice(0, limite)
}

async function restauranteGerenciado(req: AuthRequest) {
  return buscarRestauranteDoUsuario(req.userId, req.userEmail, req.userName)
}

// POST /api/denuncias/produtos — cliente denuncia um item do cardápio
router.post('/produtos', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const produtoId = limparTexto(req.body.produtoId || req.body.cardapioId, 80)
    const motivo = limparTexto(req.body.motivo, 120)
    const detalhe = limparTexto(req.body.detalhe, 500)

    if (!produtoId || !motivo) {
      return res.status(400).json({ erro: 'Produto e motivo são obrigatórios.' }) as any
    }

    const produto = await db.execute({
      sql: `SELECT c.id, c.nome, c.restaurante_id, r.nome AS restaurante_nome
            FROM cardapio c
            INNER JOIN restaurantes r ON r.id = c.restaurante_id
            WHERE c.id = ?
            LIMIT 1`,
      args: [produtoId]
    })

    if (!produto.rows.length) {
      return res.status(404).json({ erro: 'Produto não encontrado para denúncia.' }) as any
    }

    const item = produto.rows[0] as any
    const id = `den_${crypto.randomUUID().slice(0, 12)}`

    await db.execute({
      sql: `INSERT INTO denuncias_produtos
            (id, produto_id, restaurante_id, cliente_id, produto_nome, motivo, detalhe, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'aberta')`,
      args: [id, item.id, item.restaurante_id, req.userId || null, item.nome, motivo, detalhe]
    })

    const criada = await db.execute({
      sql: 'SELECT * FROM denuncias_produtos WHERE id = ?',
      args: [id]
    })

    res.status(201).json(criada.rows[0] || { id, mensagem: 'Denúncia registrada.' })
  } catch (error) {
    console.error('Erro ao criar denúncia de produto:', error)
    res.status(500).json({ erro: 'Erro ao registrar denúncia.' })
  }
})

// GET /api/denuncias/produtos — gerente vê as denúncias da própria loja; operador vê todas
router.get('/produtos', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const status = limparTexto(req.query.status, 40)
    let sql = `SELECT d.*, r.nome AS restaurante_nome
               FROM denuncias_produtos d
               LEFT JOIN restaurantes r ON r.id = d.restaurante_id
               WHERE 1=1`
    const args: any[] = []

    if (status) {
      sql += ' AND d.status = ?'
      args.push(status)
    }

    if (ehOperador(req)) {
      // Operador audita tudo.
    } else if (['gerente', 'restaurante'].includes(perfil(req))) {
      const rest = await restauranteGerenciado(req)
      if (!rest?.id) return res.status(404).json({ erro: 'Restaurante não encontrado para este usuário.' }) as any
      sql += ' AND d.restaurante_id = ?'
      args.push(rest.id)
    } else {
      sql += ' AND d.cliente_id = ?'
      args.push(req.userId)
    }

    sql += ' ORDER BY d.created_at DESC LIMIT 100'
    const result = await db.execute({ sql, args })
    res.json(result.rows)
  } catch (error) {
    console.error('Erro ao listar denúncias de produto:', error)
    res.status(500).json({ erro: 'Erro ao listar denúncias.' })
  }
})

// PUT /api/denuncias/produtos/:id — gerente/operador atualiza status ou resposta
router.put('/produtos/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const id = limparTexto(req.params.id, 80)
    const status = limparTexto(req.body.status, 40)
    const resposta = limparTexto(req.body.resposta, 500)
    const permitidos = ['aberta', 'em_analise', 'resolvida', 'arquivada']

    if (status && !permitidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido.' }) as any
    }

    const atual = await db.execute({
      sql: 'SELECT * FROM denuncias_produtos WHERE id = ? LIMIT 1',
      args: [id]
    })
    if (!atual.rows.length) return res.status(404).json({ erro: 'Denúncia não encontrada.' }) as any

    const denuncia = atual.rows[0] as any
    if (!ehOperador(req)) {
      if (!['gerente', 'restaurante'].includes(perfil(req))) {
        return res.status(403).json({ erro: 'Apenas o restaurante pode tratar esta denúncia.' }) as any
      }
      const rest = await restauranteGerenciado(req)
      if (!rest?.id || String(rest.id) !== String(denuncia.restaurante_id)) {
        return res.status(403).json({ erro: 'Você não pode tratar denúncia de outro restaurante.' }) as any
      }
    }

    const sets: string[] = []
    const args: any[] = []
    if (status) {
      sets.push('status = ?')
      args.push(status)
    }
    if (req.body.resposta !== undefined) {
      sets.push('resposta = ?')
      args.push(resposta)
    }

    if (!sets.length) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' }) as any

    sets.push('updated_at = CURRENT_TIMESTAMP')
    args.push(id)
    await db.execute({
      sql: `UPDATE denuncias_produtos SET ${sets.join(', ')} WHERE id = ?`,
      args
    })

    const atualizada = await db.execute({
      sql: 'SELECT * FROM denuncias_produtos WHERE id = ?',
      args: [id]
    })
    res.json(atualizada.rows[0])
  } catch (error) {
    console.error('Erro ao atualizar denúncia de produto:', error)
    res.status(500).json({ erro: 'Erro ao atualizar denúncia.' })
  }
})

export default router
