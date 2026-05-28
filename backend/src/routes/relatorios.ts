// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { buscarRestauranteDoUsuario } from '../lib/schema'

const router = Router()
const BR_OFFSET_HORAS = 3 // Turso/SQLite salva CURRENT_TIMESTAMP em UTC; Fortaleza/Brasil = UTC-3.

function addDiasISO(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

function normalizarDataInicio(valor: string) {
  if (!valor) return new Date(Date.now() - 30 * 86400_000).toISOString().replace('T', ' ').slice(0, 19)
  return valor.length === 10 ? `${valor} 03:00:00` : valor.replace('T', ' ').replace('Z', '').slice(0, 19)
}

function normalizarDataFim(valor: string) {
  if (!valor) return new Date().toISOString().replace('T', ' ').slice(0, 19)
  if (valor.length === 10) return `${addDiasISO(valor, 1)} 02:59:59`
  return valor.replace('T', ' ').replace('Z', '').slice(0, 19)
}

async function resolverEscopo(req: AuthRequest) {
  const role = String(req.userRole || '').toLowerCase()
  if (role === 'operador') return { precisaFiltrar: false, restauranteId: null, restaurante: null, autorizado: true }
  const precisaFiltrar = ['gerente', 'restaurante'].includes(role)
  if (!precisaFiltrar) return { precisaFiltrar: false, restauranteId: null, restaurante: null, autorizado: false }

  const restaurante = await buscarRestauranteDoUsuario(req.userId, req.userEmail, req.userName)
  return { precisaFiltrar: true, restauranteId: restaurante?.id || null, restaurante, autorizado: true }
}

function filtroPedido(restauranteId: string | null, alias = 'p') {
  return restauranteId ? { sql: ` AND ${alias}.restaurante_id = ?`, args: [restauranteId] } : { sql: '', args: [] }
}

function dinheiro(valor: any) {
  return Number(Number(valor || 0).toFixed(2))
}

function metricasResumo(obj: Record<string, any>, descricoes: Record<string, string> = {}) {
  return Object.entries(obj).map(([indicador, valor]) => ({ indicador, valor, descricao: descricoes[indicador] || '' }))
}

async function query(sql: string, args: any[] = []) {
  const r = await db.execute({ sql, args })
  return r.rows as any[]
}

function montarResposta(tipo: string, restauranteId: string | null, dataInicio: string, dataFim: string, payload: any) {
  return {
    tipo,
    restauranteId: restauranteId || null,
    periodo: { inicio: dataInicio, fim: dataFim, timezone: 'America/Fortaleza' },
    ...payload,
  }
}

const TIPOS_RELATORIO: Record<string, string> = {
  REL001: 'vendas',
  REL002: 'desempenho-restaurantes',
  REL003: 'eficiencia-entregadores',
  REL004: 'mapa-calor',
  REL005: 'taxa-cancelamento',
  REL006: 'satisfacao-cliente',
  REL007: 'financeiro-comissoes',
  REL008: 'produtos-top',
  REL009: 'tempo-entrega',
  REL010: 'fidelizacao',
  REL011: 'cancelamentos-reembolsos',
  REL012: 'crescimento-base',
}

function normalizarTipoRelatorio(valor: any) {
  const raw = String(valor || 'vendas').trim()
  return TIPOS_RELATORIO[raw.toUpperCase()] || raw.toLowerCase()
}

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const tipo = normalizarTipoRelatorio(req.query.tipo)
    const dataInicio = normalizarDataInicio(String(req.query.inicio || ''))
    const dataFim = normalizarDataFim(String(req.query.fim || ''))
    const { precisaFiltrar, restauranteId, autorizado } = await resolverEscopo(req)

    if (!autorizado) {
      return res.status(403).json({ erro: 'Apenas gerentes e operadores podem acessar relatórios' }) as any
    }

    if (precisaFiltrar && !restauranteId) {
      return res.status(404).json({ erro: 'Nenhum restaurante vinculado ao usuário logado' }) as any
    }

    const fp = filtroPedido(restauranteId, 'p')
    let dados: any = null

    switch (tipo) {
      case 'vendas': {
        const resumo = (await query(
          `SELECT COUNT(*) as total_pedidos,
                  SUM(CASE WHEN p.status = 'entregue' THEN 1 ELSE 0 END) as pedidos_entregues,
                  SUM(CASE WHEN p.status = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados,
                  COALESCE(SUM(p.subtotal), 0) as subtotal,
                  COALESCE(SUM(p.taxa_entrega), 0) as taxa_entrega_total,
                  COALESCE(SUM(p.desconto), 0) as desconto_total,
                  COALESCE(SUM(p.total), 0) as faturamento_bruto,
                  COALESCE(SUM(CASE WHEN p.status = 'entregue' THEN p.total ELSE 0 END), 0) as faturamento_confirmado,
                  COALESCE(AVG(p.total), 0) as ticket_medio
           FROM pedidos p
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}`,
          [dataInicio, dataFim, ...fp.args]
        ))[0] || {}
        const porStatus = await query(
          `SELECT p.status, COUNT(*) as quantidade, COALESCE(SUM(p.total),0) as valor
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY p.status ORDER BY quantidade DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const porDia = await query(
          `SELECT DATE(DATE_SUB(p.created_at, INTERVAL ${BR_OFFSET_HORAS} HOUR)) as dia,
                  COUNT(*) as pedidos,
                  COALESCE(SUM(p.total),0) as faturamento,
                  COALESCE(AVG(p.total),0) as ticket_medio
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY dia ORDER BY dia`,
          [dataInicio, dataFim, ...fp.args]
        )
        const pagamentos = await query(
          `SELECT p.forma_pagamento, COUNT(*) as pedidos, COALESCE(SUM(p.total),0) as valor
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY p.forma_pagamento ORDER BY valor DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const recentes = await query(
          `SELECT p.id, p.status, p.total, p.forma_pagamento, p.created_at, c.nome as cliente
           FROM pedidos p LEFT JOIN clientes c ON c.id = p.cliente_id
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           ORDER BY p.created_at DESC LIMIT 12`,
          [dataInicio, dataFim, ...fp.args]
        )
        const indicadores = {
          total_pedidos: Number(resumo.total_pedidos || 0),
          pedidos_entregues: Number(resumo.pedidos_entregues || 0),
          pedidos_cancelados: Number(resumo.pedidos_cancelados || 0),
          faturamento_bruto: dinheiro(resumo.faturamento_bruto),
          faturamento_confirmado: dinheiro(resumo.faturamento_confirmado),
          ticket_medio: dinheiro(resumo.ticket_medio),
          desconto_total: dinheiro(resumo.desconto_total),
          taxa_entrega_total: dinheiro(resumo.taxa_entrega_total),
        }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: recentes, series: { por_status: porStatus, por_dia: porDia, formas_pagamento: pagamentos } }
        break
      }

      case 'desempenho-restaurantes': {
        const linhas = await query(
          `SELECT r.id, r.nome, r.categoria, r.status,
                  COUNT(p.id) as total_pedidos,
                  SUM(CASE WHEN p.status = 'entregue' THEN 1 ELSE 0 END) as entregues,
                  SUM(CASE WHEN p.status = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
                  COALESCE(SUM(p.total), 0) as faturamento,
                  COALESCE(AVG(p.total), 0) as ticket_medio,
                  COALESCE(r.avaliacao_media, 0) as avaliacao_media,
                  COALESCE(r.tempo_medio_preparo, 0) as tempo_medio_preparo
           FROM restaurantes r
           LEFT JOIN pedidos p ON r.id = p.restaurante_id AND p.created_at BETWEEN ? AND ?
           WHERE ${restauranteId ? 'r.id = ?' : "COALESCE(r.status,'ativo') IN ('ativo','fechado')"}
           GROUP BY r.id, r.nome, r.categoria, r.status, r.avaliacao_media, r.tempo_medio_preparo
           ORDER BY faturamento DESC, total_pedidos DESC`,
          restauranteId ? [dataInicio, dataFim, restauranteId] : [dataInicio, dataFim]
        )
        const principal = linhas[0] || {}
        dados = {
          indicadores: {
            restaurante: principal.nome || restaurante?.nome || '—',
            total_pedidos: Number(principal.total_pedidos || 0),
            faturamento: dinheiro(principal.faturamento),
            ticket_medio: dinheiro(principal.ticket_medio),
            avaliacao_media: dinheiro(principal.avaliacao_media),
            cancelamentos: Number(principal.cancelados || 0),
          },
          resumo: metricasResumo({
            total_pedidos: Number(principal.total_pedidos || 0),
            faturamento: dinheiro(principal.faturamento),
            ticket_medio: dinheiro(principal.ticket_medio),
            avaliacao_media: dinheiro(principal.avaliacao_media),
          }),
          detalhes: linhas,
        }
        break
      }

      case 'eficiencia-entregadores': {
        const entregadores = await query(
          `SELECT e.id, e.nome, e.veiculo_tipo, e.status,
                  COUNT(p.id) as entregas_realizadas,
                  COALESCE(SUM(p.taxa_entrega), 0) as ganhos_estimados,
                  COALESCE(AVG(p.tempo_entrega_estimado), 0) as tempo_medio_entrega,
                  COALESCE(AVG(ro.distancia_km), 0) as distancia_media,
                  COALESCE(e.avaliacao_media, 0) as avaliacao_media
           FROM pedidos p
           JOIN entregadores e ON e.id = p.entregador_id
           LEFT JOIN rotas ro ON ro.pedido_id = p.id
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY e.id, e.nome, e.veiculo_tipo, e.status, e.avaliacao_media
           ORDER BY entregas_realizadas DESC, avaliacao_media DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const totalEntregas = entregadores.reduce((s, e) => s + Number(e.entregas_realizadas || 0), 0)
        const ganhos = entregadores.reduce((s, e) => s + Number(e.ganhos_estimados || 0), 0)
        dados = {
          indicadores: { entregadores_ativos: entregadores.length, entregas_realizadas: totalEntregas, ganhos_estimados: dinheiro(ganhos) },
          resumo: metricasResumo({ entregadores_ativos: entregadores.length, entregas_realizadas: totalEntregas, ganhos_estimados: dinheiro(ganhos) }),
          detalhes: entregadores,
        }
        break
      }

      case 'mapa-calor': {
        const porHora = await query(
          `SELECT DATE_FORMAT(DATE_SUB(p.created_at, INTERVAL ${BR_OFFSET_HORAS} HOUR), '%H') as hora,
                  COUNT(*) as quantidade,
                  COALESCE(SUM(p.total),0) as valor,
                  COALESCE(AVG(p.total),0) as ticket_medio
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY hora ORDER BY hora`,
          [dataInicio, dataFim, ...fp.args]
        )
        const porDiaSemana = await query(
          `SELECT CASE DAYOFWEEK(DATE_SUB(p.created_at, INTERVAL ${BR_OFFSET_HORAS} HOUR))
                    WHEN 1 THEN 'Domingo' WHEN 2 THEN 'Segunda' WHEN 3 THEN 'Terça'
                    WHEN 4 THEN 'Quarta' WHEN 5 THEN 'Quinta' WHEN 6 THEN 'Sexta' ELSE 'Sábado' END as dia_semana,
                  COUNT(*) as quantidade,
                  COALESCE(SUM(p.total),0) as valor,
                  COALESCE(AVG(p.total),0) as ticket_medio
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY dia_semana ORDER BY quantidade DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const pico = [...porHora].sort((a,b) => Number(b.quantidade)-Number(a.quantidade))[0]
        dados = {
          indicadores: { hora_pico: pico ? `${pico.hora}h` : '—', pedidos_no_pico: Number(pico?.quantidade || 0), total_faixas: porHora.length },
          resumo: metricasResumo({ hora_pico: pico ? `${pico.hora}h` : '—', pedidos_no_pico: Number(pico?.quantidade || 0), total_faixas: porHora.length }),
          detalhes: porHora,
          series: { por_hora: porHora, por_dia_semana: porDiaSemana },
        }
        break
      }

      case 'taxa-cancelamento': {
        const resumo = (await query(
          `SELECT COUNT(*) as total_pedidos,
                  SUM(CASE WHEN p.status = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
                  CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(100.0 * SUM(CASE WHEN p.status = 'cancelado' THEN 1 ELSE 0 END) / COUNT(*), 2) END as percentual_cancelamento,
                  COALESCE(SUM(CASE WHEN p.status = 'cancelado' THEN p.total ELSE 0 END), 0) as valor_cancelado
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}`,
          [dataInicio, dataFim, ...fp.args]
        ))[0] || {}
        const cancelados = await query(
          `SELECT p.id, p.total, p.motivo_cancelamento, p.created_at, c.nome as cliente
           FROM pedidos p LEFT JOIN clientes c ON c.id = p.cliente_id
           WHERE p.status='cancelado' AND p.created_at BETWEEN ? AND ?${fp.sql}
           ORDER BY p.created_at DESC LIMIT 30`,
          [dataInicio, dataFim, ...fp.args]
        )
        const indicadores = {
          total_pedidos: Number(resumo.total_pedidos || 0),
          cancelados: Number(resumo.cancelados || 0),
          percentual_cancelamento: dinheiro(resumo.percentual_cancelamento),
          valor_cancelado: dinheiro(resumo.valor_cancelado),
        }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: cancelados }
        break
      }

      case 'satisfacao-cliente': {
        const resumo = (await query(
          `SELECT COALESCE(AVG(a.estrelas), AVG(p.avaliacao_restaurante), 0) as media_avaliacoes,
                  COUNT(a.id) + COUNT(p.avaliacao_restaurante) as total_avaliacoes,
                  SUM(CASE WHEN COALESCE(a.estrelas, p.avaliacao_restaurante) >= 4 THEN 1 ELSE 0 END) as promotores,
                  SUM(CASE WHEN COALESCE(a.estrelas, p.avaliacao_restaurante) <= 2 THEN 1 ELSE 0 END) as detratores
           FROM pedidos p
           LEFT JOIN avaliacoes a ON a.pedido_id = p.id AND a.tipo = 'restaurante'
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}`,
          [dataInicio, dataFim, ...fp.args]
        ))[0] || {}
        const avaliacoes = await query(
          `SELECT a.estrelas, a.comentario, a.created_at, c.nome as cliente, p.id as pedido_id
           FROM avaliacoes a
           LEFT JOIN pedidos p ON p.id = a.pedido_id
           LEFT JOIN clientes c ON c.id = a.cliente_id
           WHERE a.tipo='restaurante' AND a.created_at BETWEEN ? AND ?${fp.sql}
           ORDER BY a.created_at DESC LIMIT 30`,
          [dataInicio, dataFim, ...fp.args]
        )
        const total = Number(resumo.total_avaliacoes || 0)
        const nps = total ? Math.round(((Number(resumo.promotores || 0) - Number(resumo.detratores || 0)) / total) * 100) : 0
        const indicadores = { media_avaliacoes: dinheiro(resumo.media_avaliacoes), total_avaliacoes: total, nps_estimado: nps, promotores: Number(resumo.promotores || 0), detratores: Number(resumo.detratores || 0) }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: avaliacoes }
        break
      }

      case 'financeiro-comissoes': {
        const resumo = (await query(
          `SELECT COALESCE(SUM(p.total), 0) as faturamento_total,
                  COALESCE(SUM(p.total * r.taxa_comissao / 100), 0) as comissao_plataforma,
                  COALESCE(SUM(p.total - (p.total * r.taxa_comissao / 100)), 0) as repasse_restaurante,
                  COALESCE(SUM(p.taxa_entrega), 0) as taxa_entrega_total,
                  COUNT(p.id) as pedidos_entregues,
                  COALESCE(AVG(r.taxa_comissao), 0) as taxa_media_comissao
           FROM pedidos p JOIN restaurantes r ON p.restaurante_id = r.id
           WHERE p.status = 'entregue' AND p.created_at BETWEEN ? AND ?${fp.sql}`,
          [dataInicio, dataFim, ...fp.args]
        ))[0] || {}
        const porDia = await query(
          `SELECT DATE(DATE_SUB(p.created_at, INTERVAL ${BR_OFFSET_HORAS} HOUR)) as dia,
                  COALESCE(SUM(p.total), 0) as faturamento,
                  COALESCE(SUM(p.total * r.taxa_comissao / 100), 0) as comissao,
                  COALESCE(SUM(p.total - (p.total * r.taxa_comissao / 100)), 0) as repasse
           FROM pedidos p JOIN restaurantes r ON p.restaurante_id = r.id
           WHERE p.status='entregue' AND p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY dia ORDER BY dia`,
          [dataInicio, dataFim, ...fp.args]
        )
        const indicadores = {
          faturamento_total: dinheiro(resumo.faturamento_total),
          comissao_plataforma: dinheiro(resumo.comissao_plataforma),
          repasse_restaurante: dinheiro(resumo.repasse_restaurante),
          taxa_entrega_total: dinheiro(resumo.taxa_entrega_total),
          pedidos_entregues: Number(resumo.pedidos_entregues || 0),
          taxa_media_comissao: dinheiro(resumo.taxa_media_comissao),
        }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: porDia, series: { dre_por_dia: porDia } }
        break
      }

      case 'produtos-top': {
        const args: any[] = [dataInicio, dataFim]
        let where = ''
        if (restauranteId) { where = 'WHERE c.restaurante_id = ?'; args.push(restauranteId) }
        const whereCardapio = restauranteId ? 'WHERE c.restaurante_id = ?' : ''
        const argsCardapio = restauranteId ? [restauranteId] : []
        const produtos = await query(
          `SELECT c.id, c.nome, c.categoria, c.preco,
                  COUNT(p.id) as pedidos_no_periodo,
                  COALESCE(SUM(p.total),0) as receita_associada,
                  COALESCE(AVG(p.total),0) as ticket_medio_pedido
           FROM cardapio c
           LEFT JOIN pedidos p ON p.restaurante_id = c.restaurante_id
             AND p.itens LIKE '%' || c.id || '%'
             AND p.created_at BETWEEN ? AND ?
           ${where}
           GROUP BY c.id, c.nome, c.categoria, c.preco
           ORDER BY pedidos_no_periodo DESC, receita_associada DESC, c.created_at DESC
           LIMIT 30`,
          args
        )
        const precosPorCategoria = await query(
          `SELECT COALESCE(NULLIF(c.categoria, ''), 'Sem categoria') as categoria,
                  COUNT(*) as produtos,
                  COALESCE(AVG(c.preco), 0) as preco_medio,
                  COALESCE(MIN(c.preco), 0) as menor_preco,
                  COALESCE(MAX(c.preco), 0) as maior_preco
           FROM cardapio c
           ${whereCardapio}
           GROUP BY COALESCE(NULLIF(c.categoria, ''), 'Sem categoria')
           ORDER BY produtos DESC, preco_medio DESC`,
          argsCardapio
        )
        const top = produtos[0] || {}
        const totalProdutos = produtos.length
        const precoMedioCardapio = totalProdutos
          ? produtos.reduce((s, p) => s + Number(p.preco || 0), 0) / totalProdutos
          : 0
        dados = {
          indicadores: {
            produtos_cadastrados: totalProdutos,
            produto_mais_vendido: top.nome || '—',
            vendas_top: Number(top.pedidos_no_periodo || 0),
            preco_medio_cardapio: dinheiro(precoMedioCardapio),
            categorias_com_produtos: precosPorCategoria.length,
          },
          resumo: metricasResumo({
            produtos_cadastrados: totalProdutos,
            produto_mais_vendido: top.nome || '—',
            vendas_top: Number(top.pedidos_no_periodo || 0),
            preco_medio_cardapio: dinheiro(precoMedioCardapio),
          }),
          detalhes: produtos,
          series: { precos_por_categoria: precosPorCategoria },
        }
        break
      }

      case 'tempo-entrega': {
        const resumo = (await query(
          `SELECT COALESCE(AVG(p.tempo_preparo_estimado), 0) as preparo_medio,
                  COALESCE(AVG(p.tempo_entrega_estimado), 0) as entrega_media,
                  COALESCE(AVG(p.tempo_total_estimado), 0) as total_medio,
                  COALESCE(MIN(p.tempo_entrega_estimado), 0) as entrega_minima,
                  COALESCE(MAX(p.tempo_entrega_estimado), 0) as entrega_maxima,
                  COUNT(*) as pedidos_com_tempo
           FROM pedidos p WHERE p.created_at BETWEEN ? AND ?${fp.sql}`,
          [dataInicio, dataFim, ...fp.args]
        ))[0] || {}
        const rotas = await query(
          `SELECT p.id, p.status, p.tempo_preparo_estimado, p.tempo_entrega_estimado, p.tempo_total_estimado,
                  ro.distancia_km, ro.duracao_estimada, p.created_at
           FROM pedidos p LEFT JOIN rotas ro ON ro.pedido_id = p.id
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           ORDER BY p.created_at DESC LIMIT 30`,
          [dataInicio, dataFim, ...fp.args]
        )
        const indicadores = {
          preparo_medio_min: dinheiro(resumo.preparo_medio),
          entrega_media_min: dinheiro(resumo.entrega_media),
          total_medio_min: dinheiro(resumo.total_medio),
          entrega_minima_min: dinheiro(resumo.entrega_minima),
          entrega_maxima_min: dinheiro(resumo.entrega_maxima),
        }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: rotas }
        break
      }

      case 'fidelizacao': {
        const clientes = await query(
          `SELECT p.cliente_id, COALESCE(c.nome, p.cliente_id) as cliente,
                  COUNT(*) as pedidos_cliente,
                  COALESCE(SUM(p.total), 0) as valor_total,
                  MAX(p.created_at) as ultimo_pedido,
                  CASE WHEN COUNT(*) >= 5 THEN 'VIP' WHEN COUNT(*) >= 2 THEN 'recorrente' ELSE 'novo' END as segmento
           FROM pedidos p LEFT JOIN clientes c ON c.id = p.cliente_id
           WHERE p.created_at BETWEEN ? AND ?${fp.sql}
           GROUP BY p.cliente_id, c.nome
           ORDER BY pedidos_cliente DESC, valor_total DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const totalClientes = clientes.length
        const recorrentes = clientes.filter(c => Number(c.pedidos_cliente) >= 2).length
        const vips = clientes.filter(c => Number(c.pedidos_cliente) >= 5).length
        const indicadores = {
          clientes_unicos: totalClientes,
          clientes_recorrentes: recorrentes,
          clientes_vip: vips,
          taxa_retorno_percentual: totalClientes ? dinheiro((recorrentes / totalClientes) * 100) : 0,
          pedidos_medio_por_cliente: totalClientes ? dinheiro(clientes.reduce((s,c)=>s+Number(c.pedidos_cliente||0),0)/totalClientes) : 0,
        }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: clientes }
        break
      }

      case 'cancelamentos-reembolsos': {
        const cancelamentos = await query(
          `SELECT p.id, p.total as valor, p.motivo_cancelamento, p.created_at, c.nome as cliente,
                  CASE WHEN p.cancelado_em IS NOT NULL THEN 'cancelado formalmente' ELSE 'sem timestamp de cancelamento' END as status_resolucao
           FROM pedidos p LEFT JOIN clientes c ON c.id = p.cliente_id
           WHERE p.status = 'cancelado' AND p.created_at BETWEEN ? AND ?${fp.sql}
           ORDER BY p.created_at DESC`,
          [dataInicio, dataFim, ...fp.args]
        )
        const valorTotal = cancelamentos.reduce((s, p) => s + Number(p.valor || 0), 0)
        const indicadores = { total_cancelados: cancelamentos.length, valor_total: dinheiro(valorTotal), valor_medio: cancelamentos.length ? dinheiro(valorTotal / cancelamentos.length) : 0 }
        dados = { indicadores, resumo: metricasResumo(indicadores), detalhes: cancelamentos }
        break
      }

      case 'crescimento-base': {
        if (restauranteId) {
          const linhas = await query(
            `SELECT 'clientes_com_pedido' as tipo, COUNT(DISTINCT p.cliente_id) as quantidade FROM pedidos p WHERE p.restaurante_id = ?
             UNION ALL SELECT 'pedidos_totais', COUNT(*) FROM pedidos p WHERE p.restaurante_id = ?
             UNION ALL SELECT 'produtos_cadastrados', COUNT(*) FROM cardapio c WHERE c.restaurante_id = ?
             UNION ALL SELECT 'avaliacoes_recebidas', COUNT(*) FROM avaliacoes a WHERE a.restaurante_id = ?`,
            [restauranteId, restauranteId, restauranteId, restauranteId]
          )
          dados = { indicadores: Object.fromEntries(linhas.map(l => [l.tipo, Number(l.quantidade || 0)])), resumo: linhas.map(l => ({ indicador: l.tipo, valor: l.quantidade })), detalhes: linhas }
        } else {
          const linhas = await query(
            `SELECT 'restaurantes' as tipo, COUNT(*) as quantidade FROM restaurantes
             UNION ALL SELECT 'entregadores', COUNT(*) FROM entregadores
             UNION ALL SELECT 'clientes', COUNT(*) FROM clientes
             UNION ALL SELECT 'pedidos', COUNT(*) FROM pedidos`,
            []
          )
          dados = { indicadores: Object.fromEntries(linhas.map(l => [l.tipo, Number(l.quantidade || 0)])), resumo: linhas.map(l => ({ indicador: l.tipo, valor: l.quantidade })), detalhes: linhas }
        }
        break
      }

      default:
        return res.status(400).json({ erro: 'Tipo de relatório inválido' }) as any
    }

    const alertas = []
    if (dados?.indicadores?.percentual_cancelamento > 10) alertas.push('Taxa de cancelamento acima de 10%. Verificar preparo, estoque e prazo de entrega.')
    if (dados?.indicadores?.media_avaliacoes && dados.indicadores.media_avaliacoes < 4) alertas.push('Avaliação média abaixo de 4.0. Priorizar qualidade e atendimento.')
    if (dados?.indicadores?.total_pedidos === 0) alertas.push('Sem pedidos no período selecionado. Confira filtros e divulgação da loja.')
    dados.alertas = alertas

    res.json(montarResposta(tipo, restauranteId, dataInicio, dataFim, { dados }))
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao gerar relatório' })
  }
})

export default router
