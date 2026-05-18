// @ts-nocheck
import { Router, Response } from 'express'
import Stripe from 'stripe'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { buscarRestauranteDoUsuario, ensureDatabaseHealth } from '../lib/schema'

const router = Router()

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function deveProcessarComStripe(formaPagamento: string): boolean {
  return ['stripe', 'cartao_online', 'credito_online', 'debito_online'].includes(
    String(formaPagamento || '').toLowerCase()
  )
}

function chaveStripeValida(chave?: string): boolean {
  return /^sk_(test|live)_[A-Za-z0-9]+/.test(String(chave || '').trim())
}

// GET /api/pedidos
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const { status, clienteId, entregadorId } = req.query
    let { restauranteId } = req.query

    const role = String(req.userRole || '').toLowerCase()
    if (!restauranteId && ['gerente', 'restaurante'].includes(role)) {
      const restaurante = await buscarRestauranteDoUsuario(req.userId, req.userEmail, req.userName)
      if (!restaurante?.id) return res.json([]) as any
      restauranteId = restaurante.id
    }

    let sql = `SELECT p.*,
                      r.nome as restaurante_nome,
                      r.endereco as restaurante_endereco,
                      r.latitude as restaurante_latitude,
                      r.longitude as restaurante_longitude,
                      c.nome as cliente_nome,
                      c.telefone as cliente_telefone
               FROM pedidos p
               LEFT JOIN restaurantes r ON r.id = p.restaurante_id
               LEFT JOIN clientes c ON c.id = p.cliente_id
               WHERE 1=1`
    const args: any[] = []
    if (status) { sql += ' AND p.status = ?'; args.push(status) }
    if (clienteId) { sql += ' AND p.cliente_id = ?'; args.push(clienteId) }
    if (restauranteId) { sql += ' AND p.restaurante_id = ?'; args.push(restauranteId) }
    if (entregadorId) { sql += ' AND p.entregador_id = ?'; args.push(entregadorId) }
    sql += ' ORDER BY p.created_at DESC LIMIT 100'
    const result = await db.execute({ sql, args })
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao listar pedidos' })
  }
})


// GET /api/pedidos/disponiveis — pedidos sem entregador para motoboy aceitar
router.get('/disponiveis', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const result = await db.execute({
      sql: `SELECT p.*, r.nome as restaurante_nome, r.endereco as restaurante_endereco,
                   r.latitude as restaurante_latitude, r.longitude as restaurante_longitude,
                   c.nome as cliente_nome,
                   c.telefone as cliente_telefone
            FROM pedidos p
            LEFT JOIN restaurantes r ON r.id = p.restaurante_id
            LEFT JOIN clientes c ON c.id = p.cliente_id
            WHERE (p.entregador_id IS NULL OR p.entregador_id = '')
              AND p.status IN ('pendente', 'preparando', 'pronto')
            ORDER BY p.created_at ASC
            LIMIT 30`,
      args: []
    })
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao listar pedidos disponíveis' })
  }
})

// GET /api/pedidos/:id
router.get('/:id', async (req, res: Response) => {
  try {
    const result = await db.execute({
      sql: `SELECT p.*,
                   r.nome as restaurante_nome,
                   r.endereco as restaurante_endereco,
                   c.nome as cliente_nome,
                   c.telefone as cliente_telefone,
                   e.nome as entregador_nome,
                   e.telefone as entregador_telefone
            FROM pedidos p
            LEFT JOIN restaurantes r ON r.id = p.restaurante_id
            LEFT JOIN clientes c ON c.id = p.cliente_id
            LEFT JOIN entregadores e ON e.id = p.entregador_id
            WHERE p.id = ?`,
      args: [req.params.id]
    })
    if (!result.rows.length) return res.status(404).json({ erro: 'Pedido não encontrado' }) as any
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pedido' })
  }
})

// POST /api/pedidos
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureDatabaseHealth()
    const {
      clienteId,
      restauranteId,
      itens,
      endereco_entrega,
      latitude,
      longitude,
      forma_pagamento = 'cartao',
      taxa_entrega: taxaEntregaInformada,
      desconto: descontoInformado,
    } = req.body
    if (!clienteId || !restauranteId || !itens?.length) return res.status(400).json({ erro: 'Dados obrigatórios faltando' }) as any

    const restaurante = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [restauranteId] })
    if (!restaurante.rows.length) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any

    let subtotal = 0
    for (const item of itens) {
      const cardapioId = item.cardapioId || item.produtoId || item.cardapio_id || item.id
      const cardapioItem = await db.execute({ sql: 'SELECT preco FROM cardapio WHERE id = ?', args: [cardapioId] })
      if (cardapioItem.rows.length) {
        subtotal += Number(cardapioItem.rows[0].preco) * (Number(item.quantidade) || 1)
      } else {
        subtotal += Number(item.preco || item.price || 0) * (Number(item.quantidade) || 1)
      }
    }

    const dist = calcularDistancia(
      Number(restaurante.rows[0].latitude), Number(restaurante.rows[0].longitude),
      Number(latitude || 0), Number(longitude || 0)
    )
    const taxaCalculada = dist > 5 ? 12 : dist > 3 ? 8 : 5
    const taxaInformada = Number(taxaEntregaInformada)
    const taxa_entrega = Number.isFinite(taxaInformada) && taxaInformada >= 0
      ? Number(taxaInformada.toFixed(2))
      : taxaCalculada
    const descontoSolicitado = Number(descontoInformado || 0)
    const desconto = Number.isFinite(descontoSolicitado)
      ? Math.max(0, Math.min(descontoSolicitado, subtotal + taxa_entrega))
      : 0
    const total = Number(Math.max(0, subtotal + taxa_entrega - desconto).toFixed(2))

    let pagamento_id = null
    let clientSecret = null

    if (deveProcessarComStripe(forma_pagamento)) {
      if (chaveStripeValida(process.env.STRIPE_SECRET_KEY)) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim())
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'brl',
          description: `Pedido - ${restaurante.rows[0].nome}`
        })
        pagamento_id = intent.id
        clientSecret = intent.client_secret
      } else {
        console.warn('Stripe ignorado: STRIPE_SECRET_KEY ausente ou inválida para pagamento online.')
      }
    }

    const pedidoId = `ped_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
    await db.execute({
      sql: `INSERT INTO pedidos
            (id, cliente_id, restaurante_id, status, itens, endereco_entrega, latitude_entrega, longitude_entrega,
             subtotal, taxa_entrega, desconto, total, forma_pagamento, pagamento_id, pagamento_status)
            VALUES (?, ?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      args: [pedidoId, clienteId, restauranteId, JSON.stringify(itens), endereco_entrega || '', latitude || 0, longitude || 0,
             subtotal, taxa_entrega, desconto, total, forma_pagamento, pagamento_id]
    })

    res.status(201).json({ mensagem: 'Pedido criado com sucesso', id: pedidoId, clientSecret, subtotal, taxa_entrega, desconto, total })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao criar pedido' })
  }
})

// PUT /api/pedidos/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, tempo_preparo_estimado } = req.body
    const pedidoAntes = await db.execute({ sql: 'SELECT status, entregador_id FROM pedidos WHERE id = ?', args: [req.params.id] })
    const statusAnterior = (pedidoAntes.rows[0] as any)?.status
    const sets: string[] = ['updated_at = current_timestamp']
    const args: any[] = []
    if (status) {
      sets.push('status = ?'); args.push(status)
      if (status === 'confirmado') sets.push('confirmado_em = COALESCE(confirmado_em, CURRENT_TIMESTAMP)')
      if (status === 'pronto') sets.push('pronto_em = COALESCE(pronto_em, CURRENT_TIMESTAMP)')
      if (status === 'entregue') sets.push('entregue_em = COALESCE(entregue_em, CURRENT_TIMESTAMP)')
      if (status === 'cancelado') sets.push('cancelado_em = COALESCE(cancelado_em, CURRENT_TIMESTAMP)')
    }
    if (tempo_preparo_estimado !== undefined) { sets.push('tempo_preparo_estimado = ?'); args.push(tempo_preparo_estimado) }
    args.push(req.params.id)
    await db.execute({ sql: `UPDATE pedidos SET ${sets.join(', ')} WHERE id = ?`, args })
    if (status === 'entregue' && statusAnterior !== 'entregue') {
      const entregadorId = (pedidoAntes.rows[0] as any)?.entregador_id
      if (entregadorId) {
        await db.execute({
          sql: `UPDATE entregadores
                SET total_entregas = COALESCE(total_entregas, 0) + 1,
                    status = 'disponivel',
                    ultima_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?`,
          args: [entregadorId]
        })
      }
    }
    res.json({ mensagem: 'Pedido atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar pedido' })
  }
})

// DELETE /api/pedidos/:id — cancelar
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const pedido = await db.execute({ sql: 'SELECT created_at, total FROM pedidos WHERE id = ?', args: [req.params.id] })
    if (!pedido.rows.length) return res.status(404).json({ erro: 'Pedido não encontrado' }) as any
    const tempoDecorrido = (Date.now() - new Date(String(pedido.rows[0].created_at).replace(' ', 'T') + 'Z').getTime()) / 60000
    await db.execute({ sql: "UPDATE pedidos SET status = 'cancelado' WHERE id = ?", args: [req.params.id] })
    const multa = tempoDecorrido > 5 ? Number(pedido.rows[0].total) * 0.5 : 0
    res.json({ mensagem: 'Pedido cancelado', multa })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cancelar pedido' })
  }
})

// GET /api/pedidos/:id/rastrear
router.get('/:id/rastrear', async (req, res: Response) => {
  try {
    const result = await db.execute({
      sql: `SELECT p.*,
              r.nome as restaurante_nome, r.latitude as rest_lat, r.longitude as rest_lng,
              e.nome as entregador_nome, e.telefone as entregador_telefone, e.latitude as entregador_lat, e.longitude as entregador_lng,
              c.nome as cliente_nome, c.telefone as cliente_telefone
            FROM pedidos p
            LEFT JOIN restaurantes r ON p.restaurante_id = r.id
            LEFT JOIN entregadores e ON p.entregador_id = e.id
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.id = ?`,
      args: [req.params.id]
    })
    if (!result.rows.length) return res.status(404).json({ erro: 'Pedido não encontrado' }) as any
    const p = result.rows[0] as any
    if (!p.entregador_id) {
      return res.json({
        pedido_id: p.id,
        status: p.status,
        mensagem: 'Aguardando entregador',
        avaliacao_restaurante: p.avaliacao_restaurante,
        avaliacao_entregador: p.avaliacao_entregador,
        restaurante: { id: p.restaurante_id, nome: p.restaurante_nome }
      }) as any
    }

    const dist = calcularDistancia(Number(p.entregador_lat), Number(p.entregador_lng), Number(p.latitude_entrega), Number(p.longitude_entrega))
    res.json({
      pedido_id: p.id,
      status: p.status,
      avaliacao_restaurante: p.avaliacao_restaurante,
      avaliacao_entregador: p.avaliacao_entregador,
      restaurante: { id: p.restaurante_id, nome: p.restaurante_nome, localizacao: { lat: p.rest_lat, lng: p.rest_lng } },
      entregador: { id: p.entregador_id, nome: p.entregador_nome, telefone: p.entregador_telefone, localizacao_atual: { lat: p.entregador_lat, lng: p.entregador_lng } },
      destino: { endereco: p.endereco_entrega, localizacao: { lat: p.latitude_entrega, lng: p.longitude_entrega } },
      rota: {
        distancia_atual_km: Math.round(dist * 100) / 100,
        tempo_estimado_minutos: Math.ceil((dist / 25) * 60),
        progresso_percentual: p.distancia_km ? Math.round(((Number(p.distancia_km) - dist) / Number(p.distancia_km)) * 100) : 0
      },
      timeline: { confirmado_em: p.confirmado_em, pronto_em: p.pronto_em, entregue_em: p.entregue_em }
    })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar rastreamento' })
  }
})

// POST /api/pedidos/:id/atribuir-entregador
router.post('/:id/atribuir-entregador', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { entregadorId } = req.body
    const entregador = await db.execute({ sql: "SELECT * FROM entregadores WHERE id = ? AND status = 'disponivel'", args: [entregadorId] })
    if (!entregador.rows.length) return res.status(400).json({ erro: 'Entregador não disponível' }) as any

    const atribuido = await db.execute({
      sql: `UPDATE pedidos
            SET entregador_id = ?, status = 'entregando'
            WHERE id = ?
              AND (entregador_id IS NULL OR entregador_id = '')
              AND status IN ('pendente', 'preparando', 'pronto')`,
      args: [entregadorId, req.params.id]
    })
    if (!atribuido.rowsAffected) {
      return res.status(409).json({ erro: 'Esse pedido já foi aceito por outro entregador.' }) as any
    }

    await db.execute({ sql: "UPDATE entregadores SET status = 'ocupado' WHERE id = ?", args: [entregadorId] })

    const pedido = await db.execute({ sql: 'SELECT * FROM pedidos WHERE id = ?', args: [req.params.id] })
    const rest = await db.execute({ sql: 'SELECT latitude, longitude FROM restaurantes WHERE id = ?', args: [(pedido.rows[0] as any).restaurante_id] })
    const p = pedido.rows[0] as any
    const r = rest.rows[0] as any

    await db.execute({
      sql: `INSERT INTO rotas (id, pedido_id, entregador_id, origem_lat, origem_lng, destino_lat, destino_lng)
            VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?)`,
      args: [req.params.id, entregadorId, r.latitude, r.longitude, p.latitude_entrega, p.longitude_entrega]
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao atribuir entregador:', error)
    res.status(500).json({ erro: 'Erro ao atribuir entregador' })
  }
})

// POST /api/pedidos/:id/atribuir-entregador-automatico
router.post('/:id/atribuir-entregador-automatico', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const pedido = await db.execute({
      sql: `SELECT p.*, r.latitude as rest_lat, r.longitude as rest_lng
            FROM pedidos p JOIN restaurantes r ON p.restaurante_id = r.id WHERE p.id = ?`,
      args: [req.params.id]
    })
    if (!pedido.rows.length) return res.status(404).json({ erro: 'Pedido não encontrado' }) as any
    const p = pedido.rows[0] as any
    if (p.entregador_id) return res.status(400).json({ erro: 'Pedido já tem entregador atribuído' }) as any

    const disponiveis = await db.execute({
      sql: "SELECT * FROM entregadores WHERE status = 'disponivel' ORDER BY ultima_atualizacao DESC LIMIT 20",
      args: []
    })
    if (!disponiveis.rows.length) return res.status(503).json({ erro: 'Nenhum entregador disponível no momento' }) as any

    function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
      const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    const comDistancia = (disponiveis.rows as any[]).map(e => ({
      ...e, distancia: haversine(p.rest_lat, p.rest_lng, e.latitude, e.longitude)
    })).sort((a, b) => a.distancia - b.distancia)

    const escolhido = comDistancia[0]
    const tempo_estimado = Math.ceil(escolhido.distancia * 3)

    await db.execute({
      sql: "UPDATE pedidos SET entregador_id = ?, status = 'entregando', tempo_entrega_estimado = ?, distancia_km = ? WHERE id = ?",
      args: [escolhido.id, tempo_estimado, escolhido.distancia, req.params.id]
    })
    await db.execute({ sql: "UPDATE entregadores SET status = 'ocupado' WHERE id = ?", args: [escolhido.id] })

    res.json({
      mensagem: 'Entregador atribuído automaticamente',
      entregador_id: escolhido.id,
      entregador_nome: escolhido.nome,
      distancia_km: escolhido.distancia.toFixed(2),
      tempo_estimado_minutos: tempo_estimado
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao atribuir entregador' })
  }
})

export default router
