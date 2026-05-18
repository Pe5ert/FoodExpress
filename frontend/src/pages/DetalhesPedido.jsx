import { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import api from '../services/api'
import { formatarDataHoraBanco } from '../utils/datas'
import MobileNavBar from '../components/MobileNavBar'
import {
  ArrowLeft, MapPin, DollarSign, Package, Clock,
  CheckCircle, Truck, Star, Send, XCircle
} from 'lucide-react'

// ── Timeline de status ───────────────────────────────────────────────────────
const timeline = [
  { step: 'pendente',   label: 'Pedido recebido', Icon: Package },
  { step: 'confirmado', label: 'Confirmado',      Icon: Clock },
  { step: 'preparando', label: 'Preparando',      Icon: Clock },
  { step: 'pronto',     label: 'Pronto para entrega', Icon: CheckCircle },
  { step: 'entregando', label: 'A caminho',        Icon: Truck },
  { step: 'entregue',   label: 'Entregue',         Icon: CheckCircle },
]
const stepOrder = timeline.map(t => t.step)

function formatarMoeda(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',')
}

function formatarItensPedido(itens) {
  let lista = itens
  if (typeof lista === 'string') {
    try { lista = JSON.parse(lista) } catch { return [] }
  }
  return Array.isArray(lista) ? lista : []
}

export default function DetalhesPedido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    let intervalo = null

    const carregarPedido = async ({ silencioso = false } = {}) => {
      if (!silencioso) setCarregando(true)
      try {
        const p = await api.pedidos.buscarPorId(id)
        if (!ativo) return
        p.itens = formatarItensPedido(p.itens)
        setPedido(p)
        if (['entregue', 'cancelado'].includes(String(p.status))) {
          if (intervalo) {
            clearInterval(intervalo)
            intervalo = null
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (ativo && !silencioso) setCarregando(false)
      }
    }

    carregarPedido()
    intervalo = setInterval(() => carregarPedido({ silencioso: true }), 8000)

    const atualizarAoVoltar = () => {
      if (document.visibilityState === 'visible') carregarPedido({ silencioso: true })
    }
    document.addEventListener('visibilitychange', atualizarAoVoltar)

    return () => {
      ativo = false
      if (intervalo) clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizarAoVoltar)
    }
  }, [id])

  const [estrelas, setEstrelas] = useState(5)
  const [comentario, setComentario] = useState('')
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false)
  const [avaliacaoEntregadorEnviada, setAvaliacaoEntregadorEnviada] = useState(false)
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)
  const [erroAvaliacao, setErroAvaliacao] = useState('')

  useEffect(() => {
    if (!pedido) return
    setAvaliacaoEnviada(Boolean(pedido.avaliacao_restaurante))
    setAvaliacaoEntregadorEnviada(Boolean(pedido.avaliacao_entregador))
  }, [pedido?.id, pedido?.avaliacao_restaurante, pedido?.avaliacao_entregador])

  const enviarAvaliacao = async () => {
    if (!pedido || enviandoAvaliacao) return
    setErroAvaliacao('')
    setEnviandoAvaliacao(true)
    try {
      await api.avaliacoes.criar({
        pedidoId: pedido.id,
        restauranteId: pedido.restaurante_id,
        estrelas,
        tipo: 'restaurante',
        comentario: comentario.trim(),
      })
      setPedido(p => p ? { ...p, avaliacao_restaurante: estrelas } : p)
      setAvaliacaoEnviada(true)
    } catch (e) {
      const mensagem = e?.message || 'Erro ao enviar avaliação'
      if (mensagem.toLowerCase().includes('já avaliou')) {
        setAvaliacaoEnviada(true)
      } else {
        setErroAvaliacao(mensagem)
      }
    } finally {
      setEnviandoAvaliacao(false)
    }
  }

  const avaliarEntregador = async (nota) => {
    if (!pedido?.entregador_id || avaliacaoEntregadorEnviada) return
    try {
      await api.avaliacoes.criar({
        pedidoId: pedido.id,
        entregadorId: pedido.entregador_id,
        estrelas: nota,
        tipo: 'entregador',
      })
      setPedido(p => p ? { ...p, avaliacao_entregador: nota } : p)
      setAvaliacaoEntregadorEnviada(true)
    } catch (e) {
      if (String(e?.message || '').toLowerCase().includes('já avaliou')) {
        setAvaliacaoEntregadorEnviada(true)
      } else {
        setErroAvaliacao(e?.message || 'Erro ao avaliar entregador')
      }
    }
  }

  if (carregando) return <div className="min-h-screen flex items-center justify-center text-text-muted">Carregando pedido...</div>
  if (!pedido) return <div className="min-h-screen flex items-center justify-center text-text-muted">Pedido não encontrado</div>

  const currentIndex = pedido.status === 'cancelado' ? -1 : stepOrder.indexOf(pedido.status)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Voltar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/perfil"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft size={16} /> Voltar para Pedidos
          </Link>
          {pedido.status === 'entregue' && (
            <button
              onClick={() => {
                // Navega para a loja para repetir o pedido
                navigate(`/loja/${pedido.restaurante_id}`)
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary-light px-4 py-2 rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all border-solid"
            >
              🔁 Repetir pedido
            </button>
          )}
        </div>

        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-8">
          Pedido #{String(pedido.id).slice(-6)}
        </h1>

        {/* Timeline */}
        <Motion.div
          className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-extrabold text-text-primary mb-6">Andamento do Pedido</h2>
          <div className="flex flex-col gap-0">
            {timeline.map(({ step, label, Icon }, idx) => {
              const concluido = idx <= currentIndex
              const atual = idx === currentIndex
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      concluido ? 'bg-primary' : 'bg-surface-2 border border-border'
                    }`}>
                      <Icon size={16} className={concluido ? 'text-white' : 'text-text-muted'} />
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className={`w-0.5 h-7 mt-0.5 ${concluido && idx < currentIndex ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-6">
                    <p className={`text-sm font-bold ${concluido ? 'text-text-primary' : 'text-text-muted'}`}>{label}</p>
                    {atual && pedido.status !== 'entregue' && (
                      <p className="text-xs text-primary font-semibold mt-0.5">Em progresso...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Motion.div>

        {/* Endereço + Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <Motion.div
            className="bg-white rounded-2xl border border-border shadow-sm p-6"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <h3 className="font-display font-extrabold text-text-primary mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Endereço de Entrega
            </h3>
            <p className="text-sm font-bold text-text-primary mb-1">{pedido.endereco_entrega}</p>
            <p className="text-xs text-text-muted font-semibold">
              {formatarDataHoraBanco(pedido.created_at)}
            </p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-2xl border border-border shadow-sm p-6"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            <h3 className="font-display font-extrabold text-text-primary mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-accent" /> Resumo Financeiro
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted font-semibold">Subtotal</span>
                <span className="font-bold">R$ {formatarMoeda(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-semibold">Taxa de entrega</span>
                <span className="font-bold">R$ {formatarMoeda(pedido.taxa_entrega)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-extrabold text-text-primary">Total</span>
                <span className="font-extrabold text-primary">R$ {formatarMoeda(pedido.total)}</span>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Itens */}
        <Motion.div
          className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <h3 className="font-display font-extrabold text-text-primary mb-4 flex items-center gap-2">
            <Package size={16} className="text-secondary" /> Itens do Pedido
          </h3>
          <div className="flex flex-col gap-0">
            {pedido.itens.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-bold text-text-primary">{item.nome || item.name || item.id || 'Item'}</p>
                  <p className="text-xs text-text-muted font-semibold">Qtd: {item.quantidade}</p>
                </div>
                <p className="text-sm font-extrabold text-primary">
                  R$ {formatarMoeda(Number(item.preco || item.price || 0) * Number(item.quantidade || 1))}
                </p>
              </div>
            ))}
          </div>
        </Motion.div>

        {/* Avaliação */}
        {pedido.status === 'entregue' && !avaliacaoEnviada && (
          <Motion.div
            className="bg-white rounded-2xl border border-border shadow-sm p-6"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          >
            <h3 className="font-display font-extrabold text-text-primary mb-5 flex items-center gap-2">
              <Star size={16} className="text-accent" /> Avaliar Pedido
            </h3>
            {pedido.restaurante_nome && (
              <p className="text-sm font-bold text-text-primary mb-1">{pedido.restaurante_nome}</p>
            )}
            <p className="text-sm text-text-muted font-semibold mb-3">Quantas estrelas você dá?</p>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setEstrelas(s)}
                  className={`text-3xl transition-transform hover:scale-110 bg-transparent border-none cursor-pointer ${s <= estrelas ? 'text-accent' : 'text-border'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Deixe um comentário (opcional)..."
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors resize-none mb-4"
            />
            {erroAvaliacao && (
              <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                {erroAvaliacao}
              </p>
            )}
            <button
              type="button"
              onClick={enviarAvaliacao}
              disabled={enviandoAvaliacao}
              className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 border-none cursor-pointer"
            >
              <Send size={14} /> {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </Motion.div>
        )}

        {pedido.status === 'entregue' && pedido.entregador_id && !avaliacaoEntregadorEnviada && (
          <Motion.div
            className="bg-white rounded-2xl border border-border shadow-sm p-6 mt-4"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          >
            <h3 className="font-display font-extrabold text-text-primary mb-2 flex items-center gap-2">
              <Truck size={16} className="text-secondary" /> Avaliar Entrega
            </h3>
            <p className="text-sm text-text-muted font-semibold mb-3">
              {pedido.entregador_nome ? `Como foi a entrega com ${pedido.entregador_nome}?` : 'Como foi a entrega?'}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => avaliarEntregador(s)}
                  className="text-3xl text-accent transition-transform hover:scale-110 bg-transparent border-none cursor-pointer">
                  ★
                </button>
              ))}
            </div>
            {erroAvaliacao && avaliacaoEnviada && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                {erroAvaliacao}
              </p>
            )}
          </Motion.div>
        )}

        {avaliacaoEnviada && (
          <Motion.div
            className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center mt-4"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle size={32} className="text-accent mx-auto mb-3" />
            <p className="font-display font-extrabold text-text-primary">Restaurante avaliado!</p>
            <p className="text-sm text-text-muted font-semibold mt-1">Obrigado pelo seu feedback.</p>
          </Motion.div>
        )}

        {avaliacaoEntregadorEnviada && (
          <Motion.div
            className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 text-center mt-4"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle size={32} className="text-secondary mx-auto mb-3" />
            <p className="font-display font-extrabold text-text-primary">Entrega avaliada!</p>
            <p className="text-sm text-text-muted font-semibold mt-1">Valeu por ajudar a melhorar as entregas.</p>
          </Motion.div>
        )}

        {pedido.status !== 'entregue' && (
          <div className="bg-surface-2 border border-border rounded-2xl p-5 text-center text-sm text-text-secondary font-semibold">
            Você poderá avaliar este pedido após a entrega.
          </div>
        )}
      </main>

      <MobileNavBar />
    </div>
  )
}
