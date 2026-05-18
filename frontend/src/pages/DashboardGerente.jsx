import { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom'
import api from '../services/api'
import { formatarHoraBanco, dataISOHojeLocal } from '../utils/datas'

import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
  Settings, LogOut, TrendingUp, TrendingDown, Clock,
  CheckCircle, XCircle, Truck, Star, DollarSign,
  Bell, Menu, X, Moon, Sun
} from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'
import PedidosGerente from './gerente/PedidosGerente'
import CardapioGerente from './gerente/CardapioGerente'
import RelatoriosGerente from './gerente/RelatoriosGerente'
import ConfiguracoesGerente from './gerente/ConfiguracoesGerente'

const statusConfig = {
  'Preparando': { cor: 'text-primary bg-primary-light', icon: Clock },
  'Entregando': { cor: 'text-secondary bg-secondary/8', icon: Truck },
  'Entregue':   { cor: 'text-accent bg-accent/10', icon: CheckCircle },
  'Cancelado':  { cor: 'text-red-500 bg-red-50', icon: XCircle },
}

function numeroPedido(id) {
  return `#${String(id || '').replace(/^ped_/, '').slice(-6).toUpperCase()}`
}

function formatarItensPedido(itens) {
  let lista = itens
  if (typeof lista === 'string') {
    try { lista = JSON.parse(lista) } catch { return lista || 'Itens do pedido' }
  }
  if (!Array.isArray(lista) || !lista.length) return 'Itens do pedido'
  return lista.map((item) => {
    const nome = item?.nome || item?.name || item?.titulo || item?.id || 'Item'
    const quantidade = Number(item?.quantidade || item?.qtd || 1)
    return `${quantidade > 1 ? `${quantidade}x ` : ''}${nome}`
  }).join(', ')
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function NavbarGerente({ usuario }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { sair } = useAuth()
  const { dark, toggle } = useDarkMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendentes, setPendentes] = useState(0)
  const nomeLoja = usuario?.loja?.nome || 'Minha Loja'

  useEffect(() => {
    api.pedidos.listar({ status: 'pendente' })
      .then(lista => setPendentes(lista.length))
      .catch(() => {})
  }, [])

  const links = [
    { to: '/gerente', label: 'Painel', Icon: LayoutDashboard, exato: true },
    { to: '/gerente/pedidos', label: 'Pedidos', Icon: ShoppingBag },
    { to: '/gerente/cardapio', label: 'Cardápio', Icon: UtensilsCrossed },
    { to: '/gerente/relatorios', label: 'Relatórios', Icon: BarChart3 },
    { to: '/gerente/configuracoes', label: 'Configurações', Icon: Settings },
  ]

  const ativo = (to, exato) => exato ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="bg-secondary px-4 sm:px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-xs text-white/70 font-semibold">
            Painel do Gerente · <strong className="text-white/90">{nomeLoja}</strong>
          </span>
        </div>
        <span className="text-xs text-white/50 font-semibold hidden sm:block">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/gerente" className="shrink-0">
          <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto" />
        </Link>

        <span className="hidden lg:block text-xs font-extrabold text-secondary bg-secondary/8 px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0">
          Gerente
        </span>

        <nav className="hidden md:flex items-center flex-1 gap-0 overflow-x-auto scrollbar-none">
          {links.map((item) => {
            const Icon = item.Icon
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-1.5 px-3 h-14 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                  ativo(item.to, item.exato)
                    ? 'text-primary border-primary bg-primary-light/50'
                    : 'text-text-secondary border-transparent hover:text-primary hover:border-primary'
                }`}
              >
                <Icon size={14} />{item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Botão modo escuro */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-transparent border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all"
            title={dark ? 'Modo claro' : 'Modo escuro'}
          >
            {dark ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-text-secondary" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/gerente/pedidos')}
            title="Ver pedidos pendentes"
            className="relative w-9 h-9 rounded-full bg-transparent border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all"
          >
            <Bell size={16} className="text-text-secondary" />
            {pendentes > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-white text-[0.55rem] font-extrabold flex items-center justify-center border border-white">{pendentes > 9 ? '9+' : pendentes}</span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-full cursor-pointer hover:border-primary hover:bg-primary-light transition-all">
            <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {(usuario?.nome || 'G').charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-xs font-bold text-text-primary">
              {(usuario?.nome || 'Gerente').split(' ')[0]}
            </span>
          </div>

          <button onClick={sair}
            className="w-9 h-9 bg-transparent border border-border rounded-full flex items-center justify-center text-text-secondary cursor-pointer hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={15} />
          </button>

          <button onClick={() => setMenuOpen(m => !m)}
            className="md:hidden w-9 h-9 bg-transparent border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((item) => {
            const Icon = item.Icon
            return (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  ativo(item.to, item.exato) ? 'text-primary bg-primary-light' : 'text-text-secondary hover:bg-surface-2'
                }`}
              >
                <Icon size={16} />{item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}

// ── Painel principal ──────────────────────────────────────────────────────────
function PainelPrincipal({ usuario }) {
  const [stats, setStats] = useState([])
  const [pedidosRecentes, setPedidosRecentes] = useState([])
  const [grafico, setGrafico] = useState([])
  const [statusLoja, setStatusLoja] = useState({
    aberta: true,
    entregadoresOnline: 0,
    filaPedidos: 0,
    tempoMedio: 0,
  })

  useEffect(() => {
    // Stats de vendas hoje
    const inicio = dataISOHojeLocal(0)
    const fim = dataISOHojeLocal(0)

    api.relatorios.buscar('vendas', inicio, fim)
      .then(r => {
        const d = r.dados?.indicadores || r.dados || {}
        setStats([
          { label: 'Pedidos hoje', valor: d.total_pedidos ?? 0, bg: 'bg-primary-light', cor: 'text-primary', icon: ShoppingBag },
          { label: 'Faturamento', valor: `R$ ${Number(d.faturamento_confirmado ?? d.faturamento_bruto ?? d.faturamento ?? 0).toFixed(2)}`, bg: 'bg-accent/10', cor: 'text-accent', icon: DollarSign },
          { label: 'Ticket médio', valor: `R$ ${Number(d.ticket_medio ?? 0).toFixed(2)}`, bg: 'bg-secondary/10', cor: 'text-secondary', icon: TrendingUp },
          { label: 'Avaliação', valor: '—', bg: 'bg-yellow-50', cor: 'text-yellow-500', icon: Star },
        ])
      }).catch(console.error)

    // Pedidos recentes
    api.pedidos.listar().then(lista => {
      const recentes = lista.slice(0, 5).map(p => ({
        id: numeroPedido(p.id),
        cliente: p.cliente_nome || p.cliente_id,
        valor: Number(p.total),
        status: ['pendente','confirmado','preparando'].includes(p.status) ? 'Preparando'
              : p.status === 'entregando' ? 'Entregando'
              : p.status === 'entregue'   ? 'Entregue'
              : 'Cancelado',
        horario: formatarHoraBanco(p.created_at),
        itens: formatarItensPedido(p.itens),
      }))
      setPedidosRecentes(recentes)

      // Status dinâmico da loja baseado nos pedidos
      const ativos = lista.filter(p => ['pendente','confirmado','preparando','entregando'].includes(p.status))
      const entregando = lista.filter(p => p.status === 'entregando').length
      setStatusLoja({
        aberta: true,
        entregadoresOnline: entregando > 0 ? entregando : 0,
        filaPedidos: ativos.length,
        tempoMedio: 28,
      })
    }).catch(console.error)

    // Gráfico por hora
    api.relatorios.buscar('mapa-calor').then(r => {
      setGrafico(((r.dados?.series?.por_hora || r.dados || [])).map(d => ({ hora: `${d.hora}h`, valor: (d.quantidade ?? 0) * 50 })))
    }).catch(console.error)
  }, [])

  const maxGrafico = Math.max(...grafico.map(g => g.valor), 1)

  return (
    <div>
      <Motion.div className="mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          Olá, {(usuario?.nome || 'Gerente').split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-text-muted font-semibold mt-1">
          Aqui está o resumo de hoje na <strong className="text-text-primary">{usuario?.loja?.nome || 'sua loja'}</strong>
        </p>
      </Motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <Motion.div key={s.label} className="bg-white rounded-2xl border border-border shadow-sm p-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                {s.icon && (() => { const SI = s.icon; return <SI size={17} className={s.cor} /> })()}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-accent">
                <TrendingUp size={12} />0%
              </div>
            </div>
            <div className="font-display text-2xl font-extrabold text-text-primary leading-tight">{s.valor}</div>
            <div className="text-xs text-text-muted font-semibold mt-1">{s.label}</div>
          </Motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico */}
        <Motion.div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-5"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-base font-bold text-text-primary">Faturamento por hora</h3>
              <p className="text-xs text-text-muted font-semibold">Hoje, {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">Ao vivo</span>
          </div>
          {grafico.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-text-muted text-sm font-semibold">Sem dados de pedidos ainda</div>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {grafico.map((g, i) => (
                <Motion.div key={`${g.hora}-${i}`} className="flex flex-col items-center gap-1 flex-1"
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.4, ease: 'easeOut' }}
                  style={{ transformOrigin: 'bottom' }}>
                  <div
                    className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                    style={{ height: `${(g.valor / maxGrafico) * 100}%`, minHeight: 4 }}
                    title={`${g.hora}: R$ ${g.valor}`}
                  />
                  <span className="text-[0.6rem] text-text-muted font-semibold hidden sm:block">{g.hora}</span>
                </Motion.div>
              ))}
            </div>
          )}
        </Motion.div>

        {/* Status da loja — DINÂMICO */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm p-5"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-display text-base font-bold text-text-primary mb-4">Status da loja</h3>
          <div className="flex flex-col gap-3">
            {[
              {
                label: 'Loja',
                valor: statusLoja.aberta ? 'Aberta' : 'Fechada',
                cor: statusLoja.aberta ? 'text-accent' : 'text-red-500',
                dot: statusLoja.aberta ? 'bg-accent' : 'bg-red-500',
              },
              {
                label: 'Entregadores',
                valor: statusLoja.entregadoresOnline > 0 ? `${statusLoja.entregadoresOnline} online` : 'Nenhum ativo',
                cor: 'text-secondary',
                dot: 'bg-secondary',
              },
              {
                label: 'Fila de pedidos',
                valor: `${statusLoja.filaPedidos} pedido${statusLoja.filaPedidos !== 1 ? 's' : ''}`,
                cor: statusLoja.filaPedidos > 0 ? 'text-primary' : 'text-text-muted',
                dot: statusLoja.filaPedidos > 0 ? 'bg-primary' : 'bg-border',
              },
              {
                label: 'Tempo médio',
                valor: `${statusLoja.tempoMedio} min`,
                cor: 'text-text-primary',
                dot: 'bg-border',
              },
            ].map(({ label, valor, cor, dot }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-none">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-sm text-text-secondary font-semibold">{label}</span>
                </div>
                <span className={`text-sm font-extrabold ${cor}`}>{valor}</span>
              </div>
            ))}
          </div>
          <Link to="/gerente/pedidos" className="mt-4 block w-full py-2.5 bg-primary-light border border-primary/20 rounded-xl text-sm font-bold text-primary text-center cursor-pointer hover:bg-primary hover:text-white transition-all">
            Ver todos os pedidos
          </Link>
        </Motion.div>
      </div>

      {/* Pedidos recentes */}
      <Motion.div className="mt-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text-primary">Pedidos recentes</h3>
          <Link to="/gerente/pedidos" className="text-xs font-bold text-primary hover:underline">Ver todos</Link>
        </div>
        {pedidosRecentes.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-semibold text-sm">Nenhum pedido encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  {['Pedido', 'Cliente', 'Itens', 'Valor', 'Status', 'Hora'].map(col => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-extrabold text-text-muted uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosRecentes.map((p, i) => {
                  const cfg = statusConfig[p.status] || statusConfig['Cancelado']
                  const StatusIcon = cfg.icon
                  return (
                    <Motion.tr key={p.id}
                      className="border-b border-border last:border-none hover:bg-surface-2 transition-colors cursor-pointer"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }}>
                      <td className="px-5 py-3.5 font-display font-bold text-text-primary whitespace-nowrap">{p.id}</td>
                      <td className="px-5 py-3.5 font-semibold text-text-secondary whitespace-nowrap">{p.cliente}</td>
                      <td className="px-5 py-3.5 text-text-secondary max-w-48 truncate">{p.itens}</td>
                      <td className="px-5 py-3.5 font-display font-extrabold text-accent whitespace-nowrap">R$ {p.valor.toFixed(2).replace('.', ',')}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.cor}`}>
                          <StatusIcon size={11} />{p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-muted font-semibold whitespace-nowrap">
                        <span className="flex items-center gap-1"><Clock size={11} />{p.horario}</span>
                      </td>
                    </Motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>
    </div>
  )
}

export default function DashboardGerente() {
  const { usuario } = useAuth()
  return (
    <div className="min-h-screen bg-background pb-8">
      <NavbarGerente usuario={usuario} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route index element={<PainelPrincipal usuario={usuario} />} />
          <Route path="pedidos" element={<PedidosGerente />} />
          <Route path="cardapio" element={<CardapioGerente />} />
          <Route path="relatorios" element={<RelatoriosGerente />} />
          <Route path="configuracoes" element={<ConfiguracoesGerente />} />
        </Routes>
      </main>
    </div>
  )
}
