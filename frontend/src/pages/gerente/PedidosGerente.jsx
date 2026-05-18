import { useState, useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Truck, ShoppingBag, Search, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import { formatarHoraBanco } from '../../utils/datas'

const statusConfig = {
  Preparando: { cor: 'text-primary bg-primary-light border-primary/20', icon: Clock, texto: 'Preparando' },
  Entregando: { cor: 'text-secondary bg-secondary/8 border-secondary/20', icon: Truck, texto: 'Entregando' },
  Entregue:   { cor: 'text-accent bg-accent/10 border-accent/20', icon: CheckCircle, texto: 'Entregue' },
  Cancelado:  { cor: 'text-red-500 bg-red-50 border-red-200', icon: XCircle, texto: 'Cancelado' },
}

const statusOrdem = ['Preparando', 'Entregando', 'Entregue', 'Cancelado']

// Mapeia status da UI → status do banco
const statusParaBanco = {
  Preparando: 'confirmado',
  Entregando: 'entregando',
  Entregue:   'entregue',
  Cancelado:  'cancelado',
}

function numeroPedido(id) {
  return `#${String(id || '').replace(/^ped_/, '').slice(-6).toUpperCase()}`
}

function formatarItensPedido(itens) {
  let lista = itens
  if (typeof lista === 'string') {
    try { lista = JSON.parse(lista) } catch { return lista ? [lista] : [] }
  }
  if (!Array.isArray(lista)) return []
  return lista.map((item) => {
    const nome = item?.nome || item?.name || item?.titulo || item?.id || 'Item'
    const quantidade = Number(item?.quantidade || item?.qtd || 1)
    return `${quantidade > 1 ? `${quantidade}x ` : ''}${nome}`
  })
}

function normalizarPedido(p) {
  return {
    ...p,
    numero: numeroPedido(p.id),
    status: ['pendente', 'confirmado', 'preparando'].includes(p.status) ? 'Preparando'
          : p.status === 'entregando' ? 'Entregando'
          : p.status === 'entregue'   ? 'Entregue'
          : p.status === 'cancelado'  ? 'Cancelado'
          : 'Preparando',
    loja: p.restaurante_nome || p.restaurante_id,
    cliente: p.cliente_nome || p.cliente_id,
    valorNum: Number(p.total),
    horario: formatarHoraBanco(p.created_at),
    itens: formatarItensPedido(p.itens),
    tempo: p.tempo_preparo_estimado ? `${p.tempo_preparo_estimado} min` : '--',
  }
}

export default function PedidosGerente() {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [pedidos, setPedidos] = useState([])
  const [expandido, setExpandido] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    api.pedidos.listar()
      .then(dados => setPedidos(dados.map(normalizarPedido)))
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [])

  const pedidosFiltrados = pedidos.filter(p => {
    const buscaOk = p.id.toLowerCase().includes(busca.toLowerCase()) || p.numero.toLowerCase().includes(busca.toLowerCase()) || p.cliente.toLowerCase().includes(busca.toLowerCase())
    const statusOk = filtroStatus === 'Todos' || p.status === filtroStatus
    return buscaOk && statusOk
  })

  const avancarStatus = async (id) => {
    const pedido = pedidos.find(p => p.id === id)
    if (!pedido) return
    const idx = statusOrdem.indexOf(pedido.status)
    if (idx >= 2) return
    const novoStatusUI = statusOrdem[idx + 1]
    const novoStatusBanco = statusParaBanco[novoStatusUI]
    try {
      await api.pedidos.atualizarStatus(id, novoStatusBanco)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatusUI } : p))
    } catch (e) {
      alert('Erro ao atualizar status: ' + e.message)
    }
  }

  const cancelarPedido = async (id) => {
    try {
      await api.pedidos.cancelar(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: 'Cancelado' } : p))
    } catch (e) {
      alert('Erro ao cancelar pedido: ' + e.message)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-text-primary">Pedidos</h1>
        <p className="text-sm text-text-muted font-semibold mt-1">Acompanhe e gerencie todos os pedidos em tempo real</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por pedido ou cliente..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Todos', ...statusOrdem].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filtroStatus === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {carregando && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-text-muted font-semibold">
              Carregando pedidos...
            </Motion.div>
          )}
          {!carregando && pedidosFiltrados.length === 0 && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-text-muted font-semibold">
              Nenhum pedido encontrado.
            </Motion.div>
          )}
          {pedidosFiltrados.map((p, i) => {
            const { cor, icon: Icone } = statusConfig[p.status]
            const aberto = expandido === p.id
            return (
              <Motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandido(aberto ? null : p.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-2 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-text-primary">{p.numero}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cor}`}>
                        <Icone size={11} />{p.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary font-semibold truncate mt-0.5">{p.cliente} · {p.itens.join(', ') || 'Itens do pedido'}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="font-display font-extrabold text-accent">R$ {p.valorNum.toFixed(2).replace('.', ',')}</span>
                    <span className="text-xs text-text-muted font-semibold flex items-center gap-1"><Clock size={11} />{p.horario}</span>
                  </div>
                  <ChevronDown size={16} className={`text-text-muted shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {aberto && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border pt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Itens do pedido</p>
                          <ul className="flex flex-col gap-1">
                            {(p.itens.length ? p.itens : ['Itens do pedido']).map((item, idx) => (
                              <li key={idx} className="text-sm text-text-secondary font-semibold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />{item}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-4 mb-1">Endereço de entrega</p>
                          <p className="text-sm text-text-secondary font-semibold">{p.endereco_entrega || '—'}</p>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-4 mb-1">Horário</p>
                          <p className="text-sm text-text-secondary font-semibold">{p.horario}</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:w-48 justify-end">
                          {p.status !== 'Entregue' && p.status !== 'Cancelado' && (
                            <button
                              onClick={() => avancarStatus(p.id)}
                              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all"
                            >
                              {p.status === 'Preparando' ? 'Marcar como Saiu para Entrega' : 'Marcar como Entregue'}
                            </button>
                          )}
                          {p.status === 'Preparando' && (
                            <button
                              onClick={() => cancelarPedido(p.id)}
                              className="w-full py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-bold cursor-pointer hover:bg-red-100 transition-all"
                            >
                              Cancelar pedido
                            </button>
                          )}
                        </div>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
