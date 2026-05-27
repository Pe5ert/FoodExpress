// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { ensureDatabaseHealth } from '../lib/schema'
import crypto from 'crypto'

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
    await ensureDatabaseHealth()
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
    if (String(req.userRole || '').toLowerCase() !== 'cliente' || String(p.cliente_id || '') !== String(req.userId || '')) {
      return res.status(403).json({ erro: 'Você só pode avaliar seus próprios pedidos.' }) as any
    }
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

    const id = `aval_${crypto.randomUUID().slice(0, 12)}`
    await db.execute({
      sql: `INSERT INTO avaliacoes (id, cliente_id, pedido_id, restaurante_id, entregador_id, estrelas, comentario, tipo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, clienteId, pedidoId, tipo === 'restaurante' ? restauranteId : null, tipo === 'entregador' ? entregadorId : null, estrelas, comentario || '', tipo]
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

    const criada = await db.execute({ sql: 'SELECT * FROM avaliacoes WHERE id = ?', args: [id] })
    res.status(201).json(criada.rows[0] || { id, mensagem: 'Avaliação registrada com sucesso' })
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    res.status(500).json({ erro: 'Erro ao criar avaliação' })
  }
})

// GET /api/avaliacoes/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacaoId = req.params.id
    const result = await db.execute({
      sql: 'SELECT * FROM avaliacoes WHERE id = ?',
      args: [avaliacaoId]
    })
    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' })
    }
    const avaliacao = result.rows[0] as any
    // Validar permissão: apenas o cliente que criou pode ver detalhes
    if (String(avaliacao.cliente_id) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Você não pode acessar esta avaliação' })
    }
    res.json(avaliacao)
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error)
    res.status(500).json({ erro: 'Erro ao buscar avaliação' })
  }
})

// PUT /api/avaliacoes/:id — atualizar avaliação
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacaoId = req.params.id
    const { estrelas, comentario } = req.body

    const avaliacaoAtual = await db.execute({
      sql: 'SELECT * FROM avaliacoes WHERE id = ?',
      args: [avaliacaoId]
    })
    if (!avaliacaoAtual.rows.length) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' })
    }

    const avaliacao = avaliacaoAtual.rows[0] as any
    if (String(avaliacao.cliente_id) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Você não pode alterar esta avaliação' })
    }

    const atualizacoes: string[] = []
    const args: any[] = []

    if (estrelas !== undefined && Number.isInteger(estrelas) && estrelas >= 1 && estrelas <= 5) {
      atualizacoes.push('estrelas = ?')
      args.push(estrelas)
    }

    if (comentario !== undefined) {
      atualizacoes.push('comentario = ?')
      args.push(comentario || '')
    }

    if (!atualizacoes.length) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' })
    }

    args.push(avaliacaoId)
    await db.execute({
      sql: `UPDATE avaliacoes SET ${atualizacoes.join(', ')} WHERE id = ?`,
      args
    })

    const atualizada = await db.execute({
      sql: 'SELECT * FROM avaliacoes WHERE id = ?',
      args: [avaliacaoId]
    })
    res.json(atualizada.rows[0] || { mensagem: 'Avaliação atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    res.status(500).json({ erro: 'Erro ao atualizar avaliação' })
  }
})

// DELETE /api/avaliacoes/:id — remover avaliação
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacaoId = req.params.id
    const avaliacaoAtual = await db.execute({
      sql: 'SELECT * FROM avaliacoes WHERE id = ?',
      args: [avaliacaoId]
    })
    if (!avaliacaoAtual.rows.length) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' })
    }

    const avaliacao = avaliacaoAtual.rows[0] as any
    if (String(avaliacao.cliente_id) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Você não pode remover esta avaliação' })
    }

    await db.execute({
      sql: 'DELETE FROM avaliacoes WHERE id = ?',
      args: [avaliacaoId]
    })

    res.json({ mensagem: 'Avaliação removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover avaliação:', error)
    res.status(500).json({ erro: 'Erro ao remover avaliação' })
  }
})

export default router
