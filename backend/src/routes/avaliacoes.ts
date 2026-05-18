// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/avaliacoes
router.get('/', async (req, res: Response) => {
  try {
    const { restauranteId, entregadorId, tipo } = req.query
    let sql = 'SELECT * FROM avaliacoes WHERE 1=1'
    const args: any[] = []
    if (restauranteId && tipo === 'restaurante') { sql += ' AND restaurante_id = ?'; args.push(restauranteId) }
    if (entregadorId && tipo === 'entregador') { sql += ' AND entregador_id = ?'; args.push(entregadorId) }
    sql += ' ORDER BY created_at DESC LIMIT 50'
    const result = await db.execute({ sql, args })
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar avaliações' })
  }
})

// POST /api/avaliacoes
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pedidoId, comentario } = req.body
    const estrelas = Number(req.body.estrelas ?? req.body.avaliacao)
    const tipo = req.body.tipo || (req.body.entregadorId ? 'entregador' : 'restaurante')

    if (!pedidoId || !tipo || !Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
      return res.status(400).json({ erro: 'Dados inválidos' }) as any
    }
    if (!['restaurante', 'entregador'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo de avaliação inválido' }) as any
    }

    const pedido = await db.execute({
      sql: 'SELECT cliente_id, restaurante_id, entregador_id, status FROM pedidos WHERE id = ?',
      args: [pedidoId]
    })
    if (!pedido.rows.length) return res.status(404).json({ erro: 'Pedido não encontrado' }) as any

    const p = pedido.rows[0] as any
    if (p.status !== 'entregue') {
      return res.status(400).json({ erro: 'Você poderá avaliar este pedido após a entrega.' }) as any
    }

    const clienteId = p.cliente_id || req.userId
    const restauranteId = req.body.restauranteId || p.restaurante_id
    const entregadorId = req.body.entregadorId || p.entregador_id
    if (tipo === 'restaurante' && !restauranteId) return res.status(400).json({ erro: 'Restaurante não encontrado para avaliação' }) as any
    if (tipo === 'entregador' && !entregadorId) return res.status(400).json({ erro: 'Entregador não encontrado para avaliação' }) as any

    const jaAvaliado = await db.execute({
      sql: 'SELECT id FROM avaliacoes WHERE pedido_id = ? AND cliente_id = ? AND tipo = ?',
      args: [pedidoId, clienteId, tipo]
    })
    if (jaAvaliado.rows.length) return res.status(409).json({ erro: 'Você já avaliou este pedido' }) as any

    const result = await db.execute({
      sql: `INSERT INTO avaliacoes (id, cliente_id, pedido_id, restaurante_id, entregador_id, estrelas, comentario, tipo)
            VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)`,
      args: [clienteId, pedidoId, tipo === 'restaurante' ? restauranteId : null, tipo === 'entregador' ? entregadorId : null, estrelas, comentario || '', tipo]
    })

    if (tipo === 'restaurante' && restauranteId) {
      const media = await db.execute({ sql: 'SELECT AVG(CAST(estrelas AS FLOAT)) as media FROM avaliacoes WHERE restaurante_id = ?', args: [restauranteId] })
      await db.execute({ sql: 'UPDATE restaurantes SET avaliacao_media = ? WHERE id = ?', args: [(media.rows[0] as any).media || 5.0, restauranteId] })
      await db.execute({ sql: 'UPDATE pedidos SET avaliacao_restaurante = ?, comentario = ? WHERE id = ?', args: [estrelas, comentario || '', pedidoId] })
    }
    if (tipo === 'entregador' && entregadorId) {
      const media = await db.execute({ sql: 'SELECT AVG(CAST(estrelas AS FLOAT)) as media FROM avaliacoes WHERE entregador_id = ?', args: [entregadorId] })
      await db.execute({ sql: 'UPDATE entregadores SET avaliacao_media = ? WHERE id = ?', args: [(media.rows[0] as any).media || 5.0, entregadorId] })
      await db.execute({ sql: 'UPDATE pedidos SET avaliacao_entregador = ? WHERE id = ?', args: [estrelas, pedidoId] })
    }

    res.status(201).json({ mensagem: 'Avaliação registrada com sucesso', id: result.lastInsertRowid })
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    res.status(500).json({ erro: 'Erro ao criar avaliação' })
  }
})

export default router
