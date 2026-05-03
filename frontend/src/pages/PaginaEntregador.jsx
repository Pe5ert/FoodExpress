import { useState, useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  MapPin, Navigation, Clock, CheckCircle, Package,
  Phone, Star, DollarSign, Bike, BarChart3, Bell,
  LogOut, ChevronRight, XCircle, AlertCircle, X,
  TrendingUp, ArrowUpRight, Wifi, WifiOff
} from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'
import api from '../services/api'

// aqui e o back gelado - dados de entregador devem vir do backend
// dados carregados do backend no componente principal

// ── Mini mapa SVG ─────────────────────────────────────────────────────────────
function MiniMapa({ etapa, localizacao, entrega }) {
  const entregadorX = etapa === 'coletando' ? 60 : 200

  const abrirMaps = () => {
    const destino = entrega?.destino?.rua || ''
    if (localizacao && destino) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${localizacao.latitude},${localizacao.longitude}&destination=${encodeURIComponent(destino)}&travelmode=driving`
      window.open(url, '_blank')
    } else if (localizacao) {
      const url = `https://www.google.com/maps/@${localizacao.latitude},${localizacao.longitude},16z`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#e8f0e8] cursor-pointer group" onClick={abrirMaps}>
      <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="160" fill="#e8f0e8" />
        {[
          [10,10,80,60],[110,10,80,60],[210,10,80,60],[310,10,80,60],
          [10,90,80,60],[110,90,80,60],[210,90,80,60],[310,90,80,60],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#d4e4d4" rx="4" />
        ))}
        <rect x="0" y="70" width="400" height="18" fill="#f5f5f0" />
        <rect x="95" y="0" width="18" height="160" fill="#f5f5f0" />
        <rect x="195" y="0" width="18" height="160" fill="#f5f5f0" />
        <rect x="295" y="0" width="18" height="160" fill="#f5f5f0" />
        <polyline points="60,79 104,79 204,79 304,79 304,40" fill="none"
          stroke="#ff6b35" strokeWidth="3" strokeDasharray="6,4" strokeLinecap="round" />
        <circle cx="60" cy="79" r="10" fill="#2e294e" />
        <text x="60" y="83" textAnchor="middle" fontSize="10" fill="white">🍕</text>
        <circle cx="304" cy="40" r="10" fill="#ff6b35" />
        <text x="304" y="44" textAnchor="middle" fontSize="10" fill="white">🏠</text>
        <Motion.circle cx={entregadorX} cy="79" r="8" fill="#1b998b"
          animate={{ cx: entregadorX }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
        <Motion.text x={entregadorX} y="83" textAnchor="middle" fontSize="9" fill="white"
          animate={{ x: entregadorX }} transition={{ duration: 1.2, ease: 'easeInOut' }}>🛵</Motion.text>
      </svg>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-all bg-white text-text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <MapPin size={12} /> Abrir no Google Maps
        </div>
      </div>
      {localizacao && (
        <div className="absolute top-2 right-2 bg-accent text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          GPS ativo
        </div>
      )}
      <div className="absolute bottom-2 left-3 flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-secondary">
          <div className="w-2 h-2 rounded-full bg-secondary" /> Loja
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
          <div className="w-2 h-2 rounded-full bg-primary" /> Destino
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
          <div className="w-2 h-2 rounded-full bg-accent" /> Você
        </div>
      </div>
    </div>
  )
}

// ── Card entrega ativa ────────────────────────────────────────────────────────
function EntregaAtiva({ entrega, onAvançar, localizacao }) {
  const naLoja = entrega.etapa === 'coletando'

  return (
    <Motion.div
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cabeçalho colorido */}
      <div className={`px-5 py-3 flex items-center justify-between ${naLoja ? 'bg-primary' : 'bg-accent'}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Navigation size={13} className="text-white" />
          </div>
          <span className="text-sm font-extrabold text-white">
            {naLoja ? 'Ir até a loja' : 'Entregar ao cliente'}
          </span>
        </div>
        <span className="text-xs font-bold text-white/80">{entrega.id}</span>
      </div>

      <div className="p-5">
        <MiniMapa etapa={entrega.etapa} localizacao={localizacao} entrega={entrega} />

        {/* Info destino */}
        <div className="mt-4 flex flex-col gap-3">
          {/* De */}
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${naLoja ? 'bg-primary text-white' : 'bg-surface-2 border border-border'}`}>
              <span className="text-base">{entrega.loja.emoji}</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-0.5">
                {naLoja ? 'Buscar em' : 'Retirado em'}
              </p>
              <p className="text-sm font-bold text-text-primary">{entrega.loja.nome}</p>
              <p className="text-xs text-text-muted font-medium">{entrega.loja.endereco}</p>
            </div>
          </div>

          <div className="w-px h-4 bg-border ml-4" />

          {/* Para */}
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!naLoja ? 'bg-accent text-white' : 'bg-surface-2 border border-border'}`}>
              <MapPin size={15} className={!naLoja ? 'text-white' : 'text-text-muted'} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-0.5">Entregar em</p>
              <p className="text-sm font-bold text-text-primary">{entrega.destino.rua}</p>
              <p className="text-xs text-text-muted font-medium">{entrega.destino.bairro} · {entrega.destino.cidade}</p>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Distância', valor: entrega.distancia, icon: Bike },
            { label: 'Tempo est.', valor: entrega.tempoEstimado, icon: Clock },
            { label: 'Valor', valor: `R$ ${Number(entrega.valor || 0).toFixed(2).replace('.', ',')}`, icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-center">
                <Icon size={12} className="text-text-muted mx-auto mb-1" />
                <p className="font-display text-sm font-extrabold text-text-primary leading-none">{item.valor}</p>
                <p className="text-[10px] text-text-muted font-semibold mt-0.5">{item.label}</p>
              </div>
            )
          })}
        </div>

        {/* Cliente */}
        <div className="mt-4 flex items-center justify-between p-3 bg-surface-2 border border-border rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {entrega.cliente.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{entrega.cliente.nome}</p>
              <p className="text-xs text-text-muted font-medium">{entrega.itens}</p>
            </div>
          </div>
          <a href={`tel:${entrega.cliente.telefone}`}
            className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all">
            <Phone size={15} />
          </a>
        </div>

        {/* Botão principal */}
        <Motion.button
          onClick={onAvançar}
          className={`mt-4 w-full py-4 border-none rounded-xl font-display font-bold text-base text-white cursor-pointer flex items-center justify-center gap-2 ${naLoja ? 'bg-primary hover:bg-primary-dark' : 'bg-accent hover:bg-[#158f82]'} transition-colors`}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        >
          {naLoja ? (
            <><CheckCircle size={18} /> Cheguei na loja</>
          ) : (
            <><CheckCircle size={18} /> Entrega concluída</>
          )}
        </Motion.button>
      </div>
    </Motion.div>
  )
}

// ── Fila de pedidos ────────────────────────────────────────────────────────────
function FilaPedidos({ fila = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-text-primary">Próximas entregas</h3>
        <span className="text-xs font-extrabold text-primary bg-primary-light px-2 py-0.5 rounded-full">{fila.length} na fila</span>
      </div>
      <div className="divide-y divide-border">
        {fila.map((pedido, i) => (
          <Motion.div key={pedido.id}
            className="flex items-center gap-3 px-5 py-4"
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-xl shrink-0">
              {pedido.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm text-text-primary">{pedido.loja}</span>
                <span className="text-[10px] font-bold text-text-muted">{pedido.id}</span>
              </div>
              <p className="text-xs text-text-muted font-medium truncate">{pedido.destino}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-sm font-extrabold text-accent">R$ {Number(pedido.valor || 0).toFixed(2).replace('.', ',')}</p>
              <p className="text-xs text-text-muted font-semibold">{pedido.distancia}</p>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Histórico ─────────────────────────────────────────────────────────────────
function Historico({ historico = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-text-primary">Entregas de hoje</h3>
        <button className="text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer">Ver todas</button>
      </div>
      <div className="divide-y divide-border">
        {historico.map((h, i) => (
          <Motion.div key={h.id}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.07 }}
          >
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-lg shrink-0">
              {h.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{h.loja} → {h.cliente}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted flex items-center gap-0.5">
                  <Clock size={10} /> {h.tempo}
                </span>
                <span className="text-xs text-text-muted">{h.horario}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-sm font-extrabold text-accent">R$ {h.valor.toFixed(2).replace('.', ',')}</p>
              <div className="flex items-center justify-end gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={9} fill={j < h.avaliacao ? '#FFBA08' : 'none'} stroke={j < h.avaliacao ? '#FFBA08' : '#ccc'} />
                ))}
              </div>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Header do entregador ──────────────────────────────────────────────────────
function HeaderEntregador({ online, onToggle, usuario }) {
  const nome = usuario?.nome || 'Entregador'
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="bg-secondary px-4 sm:px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${online ? 'bg-accent animate-pulse' : 'bg-border'}`} />
          <span className="text-xs text-white/70 font-semibold">
            Painel do Entregador · <strong className={online ? 'text-accent' : 'text-white/50'}>{online ? 'Online' : 'Offline'}</strong>
          </span>
        </div>
        <span className="text-xs text-white/50 font-semibold hidden sm:block">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </span>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto shrink-0" />

        <span className="hidden sm:block text-xs font-extrabold text-accent bg-accent/10 px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0">
          Entregador
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {/* Toggle online */}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold transition-all cursor-pointer ${
              online
                ? 'bg-accent/10 border-accent/30 text-accent hover:bg-red-50 hover:border-red-300 hover:text-red-500'
                : 'bg-surface-2 border-border text-text-muted hover:bg-accent/10 hover:border-accent/30 hover:text-accent'
            }`}
          >
            {online ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span className="hidden sm:inline">{online ? 'Ficar offline' : 'Ficar online'}</span>
          </button>

          {/* Notificações */}
          <button className="relative w-9 h-9 rounded-full bg-transparent border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
            <Bell size={16} className="text-text-secondary" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-white text-[0.55rem] font-extrabold flex items-center justify-center border border-white">2</span>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-full cursor-pointer hover:border-accent hover:bg-accent/10 transition-all">
            <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
              {nome.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-xs font-bold text-text-primary">{nome.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PaginaEntregador() {
  const { usuario, sair } = useAuth()
  const [online, setOnline] = useState(false)
  const [localizacao, setLocalizacao] = useState(null)
  const [locErro, setLocErro] = useState('')
  const [etapa, setEtapa] = useState('coletando')
  const [entregaConcluida, setEntregaConcluida] = useState(false)
  const [entregaAtiva, setEntregaAtiva] = useState(null)
  const [fila, setFila] = useState([])
  const [historico, setHistorico] = useState([])
  const [stats, setStats] = useState([])
  const [entregadorId, setEntregadorId] = useState(null)

  useEffect(() => {
    // Busca ou cria dados do entregador logado
    const carregarEntregador = async () => {
      let ent = null
      try {
        ent = await api.entregadores.meuPerfil()
      } catch {
        // Entregador não existe no banco ainda — cria automaticamente
        try {
          ent = await api.entregadores.cadastrarInicial({})
        } catch (e2) {
          console.warn('Não foi possível criar entregador no backend:', e2)
          return
        }
      }
      if (!ent?.id) return
      setEntregadorId(ent.id)
      // Pedido ativo (entregando)
      try {
        const pedidosAtivos = await api.pedidos.listar({ entregadorId: ent.id, status: 'entregando' })
        if (pedidosAtivos.length > 0) {
          const p = pedidosAtivos[0]
          setEntregaAtiva({
            id: `#${String(p.id).slice(-4)}`,
            cliente: { nome: p.cliente_id, telefone: '', avatar: 'CL' },
            loja: { nome: p.restaurante_id, emoji: '🍽️', endereco: '' },
            destino: { rua: p.endereco_entrega, bairro: '', cidade: '' },
            itens: typeof p.itens === 'string' ? p.itens : JSON.stringify(p.itens),
            valor: p.total,
            distancia: p.distancia_km ? `${p.distancia_km} km` : '--',
            tempoEstimado: p.tempo_entrega_estimado ? `${p.tempo_entrega_estimado} min` : '--',
            etapa: 'coletando',
            _id: p.id,
          })
        }
      } catch (e) {
        console.warn('Erro ao buscar pedidos ativos:', e)
      }
    }
    carregarEntregador()
  }, [])

  useEffect(() => {
    if (!entregadorId) return
    // Histórico de entregas concluídas
    api.pedidos.listar({ entregadorId, status: 'entregue' })
      .then(lista => setHistorico(lista.slice(0, 10).map(p => ({
        id: `#${String(p.id).slice(-4)}`,
        loja: p.restaurante_id, emoji: '🍽️',
        cliente: p.cliente_id,
        valor: p.total,
        tempo: p.tempo_entrega_estimado ? `${p.tempo_entrega_estimado} min` : '--',
        avaliacao: p.avaliacao_entregador || 5,
        horario: new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      })))
    ).catch(() => {})
    // Stats calculados a partir do histórico
    api.pedidos.listar({ entregadorId, status: 'entregue' })
      .then(lista => {
        const hoje = new Date().toDateString()
        const hoje_lista = lista.filter(p => new Date(p.created_at).toDateString() === hoje)
        const ganhos = hoje_lista.reduce((s, p) => s + Number(p.total || 0) * 0.8, 0) // 80% vai para o entregador
        const totalEntregas = hoje_lista.length
        setHistorico(lista.slice(0, 10).map(p => ({
          id: `#${String(p.id).slice(-4)}`,
          loja: p.restaurante_id, emoji: '🍽️',
          cliente: p.cliente_id,
          valor: p.total,
          tempo: p.tempo_entrega_estimado ? `${p.tempo_entrega_estimado} min` : '--',
          avaliacao: 5,
          horario: new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        })))
        setStats([
          { label: 'Ganhos hoje', valor: `R$ ${ganhos.toFixed(2)}`, icon: DollarSign, cor: 'text-accent', bg: 'bg-accent/10', variacao: '' },
          { label: 'Entregas hoje', valor: String(totalEntregas), icon: Package, cor: 'text-primary', bg: 'bg-primary-light', variacao: '' },
          { label: 'Total entregas', valor: String(lista.length), icon: Bike, cor: 'text-secondary', bg: 'bg-secondary/10', variacao: 'all time' },
          { label: 'Avaliação', valor: '5.0', icon: Star, cor: 'text-yellow-500', bg: 'bg-yellow-50', variacao: 'média' },
        ])
      }).catch(() => {
        setStats([
          { label: 'Ganhos hoje', valor: 'R$ 0,00', icon: DollarSign, cor: 'text-accent', bg: 'bg-accent/10', variacao: '' },
          { label: 'Entregas hoje', valor: '0', icon: Package, cor: 'text-primary', bg: 'bg-primary-light', variacao: '' },
          { label: 'Total entregas', valor: '0', icon: Bike, cor: 'text-secondary', bg: 'bg-secondary/10', variacao: 'all time' },
          { label: 'Avaliação', valor: '—', icon: Star, cor: 'text-yellow-500', bg: 'bg-yellow-50', variacao: 'média' },
        ])
      })
  }, [entregadorId])

  const entrega = entregaAtiva ? { ...entregaAtiva, etapa } : null

  // Ao ficar online, pede localização e envia pro backend a cada 30s
  const handleToggleOnline = () => {
    if (!online) {
      // Ficar online: pede permissão de localização
      if (!navigator.geolocation) {
        setLocErro('Seu navegador não suporta geolocalização')
        setOnline(true) // fica online mesmo assim
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setLocalizacao({ latitude, longitude })
          setLocErro('')
          setOnline(true)
          // Envia localização inicial pro backend
          if (entregadorId) {
            api.entregadores.atualizar(entregadorId, { latitude, longitude, status: 'disponivel' })
              .catch(console.error)
          }
        },
        (err) => {
          if (err.code === 1) {
            setLocErro('Permissão de localização negada. Ative nas configurações do navegador.')
          } else {
            setLocErro('Não foi possível obter sua localização.')
          }
          setOnline(true) // fica online mesmo sem localização
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    } else {
      // Ficar offline
      setOnline(false)
      if (entregadorId) {
        api.entregadores.atualizarDisponibilidade(entregadorId, false).catch(console.error)
      }
    }
  }

  // Atualiza localização a cada 30s quando online
  useEffect(() => {
    if (!online || !entregadorId || !navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocalizacao({ latitude, longitude })
        api.entregadores.atualizar(entregadorId, { latitude, longitude }).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [online, entregadorId])

  const handleAvançar = async () => {
    if (!entrega) return
    if (etapa === 'coletando') {
      // Saiu do restaurante — status: entregando
      setEtapa('entregando')
      if (entrega._id) {
        await api.pedidos.atualizarStatus(entrega._id, 'entregando').catch(console.error)
      }
    } else {
      // Entregue ao cliente
      if (entrega._id) {
        await api.pedidos.atualizarStatus(entrega._id, 'entregue').catch(console.error)
        // Libera o entregador
        if (entregadorId) {
          await api.entregadores.atualizarDisponibilidade(entregadorId, true).catch(console.error)
        }
      }
      setEntregaAtiva(null)
      setEntregaConcluida(true)
      setTimeout(() => setEntregaConcluida(false), 3000)
      setEtapa('coletando')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <HeaderEntregador online={online} onToggle={handleToggleOnline} usuario={usuario} />

      {/* Toast de entrega concluída */}
      <AnimatePresence>
        {entregaConcluida && (
          <Motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-accent text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <CheckCircle size={18} /> Entrega concluída com sucesso!
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Banner offline */}
      <AnimatePresence>
        {locErro && (
          <Motion.div
            className="mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-yellow-800"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-base">📍</span>
            <span>{locErro}</span>
          </Motion.div>
        )}

        {!online && (
          <Motion.div
            className="bg-text-primary text-white px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          >
            <WifiOff size={16} />
            Você está offline — não receberá novos pedidos
          </Motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* Boas-vindas */}
        <Motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            Olá, {(usuario?.nome || 'Entregador').split(' ')[0]}! 🛵
          </h1>
          <p className="text-sm text-text-muted font-semibold mt-1">
            {online ? 'Você está online e recebendo pedidos.' : 'Fique online para receber novos pedidos.'}
          </p>
        </Motion.div>

        {/* Cards de stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <Motion.div key={s.label}
              className="bg-white rounded-2xl border border-border shadow-sm p-4"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                {s.icon && (() => { const SI = s.icon; return <SI size={15} className={s.cor} /> })()}
              </div>
              <div className="font-display text-xl font-extrabold text-text-primary leading-tight">{s.valor}</div>
              <div className="text-xs text-text-muted font-semibold mt-0.5">{s.label}</div>
              <div className="text-[10px] text-text-muted mt-0.5 opacity-60">{s.variacao}</div>
            </Motion.div>
          ))}
        </div>

        {/* Layout principal — 2 colunas desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

          {/* Coluna esquerda */}
          <div className="flex flex-col gap-5">
            {entrega ? <EntregaAtiva entrega={entrega} onAvançar={handleAvançar} localizacao={localizacao} /> : <div className="bg-white rounded-2xl border border-border p-8 text-center text-text-muted"><p className="text-3xl mb-3">🛵</p><p className="font-semibold">Nenhuma entrega ativa</p><p className="text-sm mt-1">Aguardando novo pedido...</p></div>}
            <Historico historico={historico} />
          </div>

          {/* Coluna direita */}
          <div className="flex flex-col gap-5">
            <FilaPedidos fila={fila} />

            {/* Card ganhos da semana */}
            <Motion.div
              className="bg-white rounded-2xl border border-border shadow-sm p-5"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-text-primary">Ganhos da semana</h3>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={11} /> +18%
                </span>
              </div>
              {/* Gráfico de barras simples */}
              <div className="flex items-end gap-2 h-24">
                {[
                  { dia: 'Seg', val: 65 }, { dia: 'Ter', val: 82 }, { dia: 'Qua', val: 45 },
                  { dia: 'Qui', val: 91 }, { dia: 'Sex', val: 78 }, { dia: 'Sáb', val: 100 },
                  { dia: 'Dom', val: 38 },
                ].map((d, i) => (
                  <div key={d.dia} className="flex flex-col items-center gap-1 flex-1">
                    <Motion.div
                      className={`w-full rounded-t-md ${i === 5 ? 'bg-primary' : 'bg-primary/25'} hover:bg-primary transition-colors`}
                      style={{ height: `${d.val}%`, minHeight: 4 }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
                      title={`${d.dia}: R$ ${d.val}`}
                    />
                    <span className="text-[9px] text-text-muted font-semibold">{d.dia}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted font-semibold">Total esta semana</span>
                <span className="font-display text-base font-extrabold text-accent">R$ 412,80</span>
              </div>
            </Motion.div>

            {/* Botão sair */}
            <button
              onClick={sair}
              className="w-full py-3 bg-white border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut size={15} /> Sair da conta
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
