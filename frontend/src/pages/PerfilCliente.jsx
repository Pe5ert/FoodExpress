import { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import MobileNavBar from '../components/MobileNavBar'
import api from '../services/api'
import {
  User, Mail, Phone, MapPin, ShoppingBag, Heart,
  ChevronRight, LogOut, Star, Clock, Edit3, Check, X
} from 'lucide-react'

// aqui e o back gelado - pedidos e endereços de cliente devem vir do backend
const statusColor = {
  Entregue: 'text-accent bg-accent/10',
  'Em andamento': 'text-primary bg-primary-light',
  Cancelado: 'text-red-500 bg-red-50',
  entregue: 'text-accent bg-accent/10',
  pendente: 'text-primary bg-primary-light',
  preparando: 'text-primary bg-primary-light',
  entregando: 'text-primary bg-primary-light',
  cancelado: 'text-red-500 bg-red-50',
}

function SecaoCard({ titulo, children, delay = 0, id }) {
  return (
    <Motion.div
      id={id}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-base font-bold text-text-primary">{titulo}</h3>
      </div>
      {children}
    </Motion.div>
  )
}

function formatarNome(nome = '') {
  return String(nome)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(' ')
}

function obterIniciais(nome = '') {
  const partes = formatarNome(nome).split(' ').filter(Boolean)
  if (!partes.length) return 'U'
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
  return `${partes[0].charAt(0)}${partes[partes.length - 1].charAt(0)}`.toUpperCase()
}


// ── Componente adicionar endereço ─────────────────────────────────────────────
function AdicionarEndereco({ clienteId, onSalvo }) {
  const [aberto, setAberto] = useState(false)
  const [rua, setRua] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!rua.trim()) return
    setSalvando(true)
    try {
      await api.clientes.atualizar(clienteId, { endereco_principal: rua })
      onSalvo({ id: Date.now(), label: 'Novo', rua, principal: false })
      setRua('')
      setAberto(false)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  if (!aberto) return (
    <button onClick={() => setAberto(true)}
      className="flex items-center gap-2 text-sm font-bold text-primary hover:underline cursor-pointer bg-transparent border-none">
      <MapPin size={15} /> Adicionar endereço
    </button>
  )
  return (
    <div className="flex flex-col gap-2 mt-1">
      <input type="text" value={rua} onChange={e => setRua(e.target.value)}
        placeholder="Ex: Rua das Flores, 123 - Bairro"
        className="w-full px-3 py-2 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
      <div className="flex gap-2">
        <button onClick={salvar} disabled={salvando}
          className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer border-none disabled:opacity-60">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button onClick={() => setAberto(false)}
          className="flex-1 py-2 bg-surface-2 border border-border rounded-xl text-xs font-bold cursor-pointer text-text-secondary">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Componente editar endereço ────────────────────────────────────────────────
function EditarEndereco({ end, clienteId, onSalvo }) {
  const [editando, setEditando] = useState(false)
  const [rua, setRua] = useState(end.rua || '')
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!rua.trim()) return
    setSalvando(true)
    try {
      await api.clientes.atualizar(clienteId, { endereco_principal: rua })
      onSalvo(rua)
      setEditando(false)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSalvando(false) }
  }

  if (!editando) return (
    <button onClick={() => setEditando(true)}
      className="text-xs font-bold text-text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer shrink-0 mt-1">
      Editar
    </button>
  )
  return (
    <div className="flex flex-col gap-1 mt-1 w-full">
      <input type="text" value={rua} onChange={e => setRua(e.target.value)}
        className="w-full px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:border-primary transition-all" />
      <div className="flex gap-1">
        <button onClick={salvar} disabled={salvando}
          className="flex-1 py-1 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer border-none disabled:opacity-60">
          {salvando ? '...' : 'Salvar'}
        </button>
        <button onClick={() => setEditando(false)}
          className="flex-1 py-1 bg-surface-2 border border-border rounded-lg text-xs font-bold cursor-pointer text-text-secondary">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function PerfilCliente() {
  const { usuario, sair } = useAuth()
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(usuario?.nome || 'Usuário')
  const [nomeTemp, setNomeTemp] = useState(nome)
  const [pedidos, setPedidos] = useState([])
  const [enderecos, setEnderecos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [clienteId, setClienteId] = useState(null)

  useEffect(() => {
    const nomeInicial = formatarNome(usuario?.nome || 'Usuário')
    setNome(nomeInicial)
    setNomeTemp(nomeInicial)
  }, [usuario?.nome])

  useEffect(() => {
    let ativo = true

    async function carregarPerfil() {
      setCarregando(true)
      try {
        const [listaPedidos, cliente] = await Promise.all([
          api.pedidos.listar({ clienteId: usuario?.id }).catch(() => []),
          api.clientes.meuPerfil().catch(async () => {
            // Cliente não existe no backend ainda — cria automaticamente
            try {
              return await api.clientes.cadastrarInicial()
            } catch {
              return null
            }
          }),
        ])

        if (!ativo) return

        setPedidos(Array.isArray(listaPedidos) ? listaPedidos : [])

        if (cliente?.id) setClienteId(cliente.id)
        if (cliente?.nome) {
          const nomeBackend = formatarNome(cliente.nome)
          setNome(nomeBackend)
          setNomeTemp(nomeBackend)
        }

        if (cliente?.endereco_principal) {
          setEnderecos([{
            id: 'principal',
            label: 'Principal',
            rua: cliente.endereco_principal,
            bairro: '',
            cidade: '',
            principal: true,
          }])
        } else {
          setEnderecos([])
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil:', err)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    if (usuario?.id) carregarPerfil()
    else setCarregando(false)

    return () => { ativo = false }
  }, [usuario?.id])

  const pedidosFormatados = pedidos.map((pedido) => {
    let itensTexto = 'Itens do pedido'
    try {
      const itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens
      if (Array.isArray(itens) && itens.length) {
        itensTexto = `${itens.length} item(ns)`
      }
    } catch {}

    return {
      id: pedido.id,
      loja: pedido.loja || pedido.restaurante_nome || `Pedido #${String(pedido.id || '').slice(0, 6)}`,
      status: pedido.status || 'Em andamento',
      itens: pedido.itens_texto || itensTexto,
      data: pedido.created_at ? new Date(pedido.created_at).toLocaleDateString('pt-BR') : '—',
      total: Number(pedido.total || 0),
      avaliacao: pedido.avaliacao || pedido.avaliacao_restaurante || 0,
      emoji: '🛍️',
    }
  })
  const iniciaisUsuario = obterIniciais(nome)
  const fotoUsuario = usuario?.fotoUrl || usuario?.avatarUrl || ''

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Coluna esquerda — Info do usuário ── */}
          <div className="w-full lg:w-72 flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Avatar + nome */}
            <Motion.div
              className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative inline-block mb-4">
                {fotoUsuario ? (
                  <div className="w-20 h-20 rounded-full bg-white border border-border shadow-sm flex items-center justify-center mx-auto overflow-hidden">
                    <img src={fotoUsuario} alt={nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-extrabold font-display mx-auto">
                    {iniciaisUsuario}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full border-2 border-white flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              </div>

              {editando ? (
                <div className="flex items-center gap-2 justify-center mb-1">
                  <input
                    value={nomeTemp} onChange={e => setNomeTemp(e.target.value)}
                    className="border border-border rounded-lg px-2 py-1 text-sm font-bold text-center outline-none focus:border-primary w-36"
                    autoFocus
                  />
                  <button onClick={() => { setNome(formatarNome(nomeTemp)); setEditando(false) }}
                    className="w-7 h-7 bg-accent rounded-full flex items-center justify-center border-none cursor-pointer">
                    <Check size={13} className="text-white" />
                  </button>
                  <button onClick={() => { setNomeTemp(nome); setEditando(false) }}
                    className="w-7 h-7 bg-surface-2 border border-border rounded-full flex items-center justify-center cursor-pointer">
                    <X size={13} className="text-text-muted" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-extrabold text-text-primary">{nome}</h2>
                  <button onClick={() => setEditando(true)}
                    className="text-text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                    <Edit3 size={14} />
                  </button>
                </div>
              )}

              <p className="text-sm text-text-muted font-semibold mb-4">{usuario?.email || 'Sem e-mail'}</p>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-4">
                {[
                  { label: 'Pedidos', valor: pedidos.length },
                  { label: 'Avaliações', valor: pedidos.filter(p => p.avaliacao_restaurante).length },
                  { label: 'Favoritos', valor: 0 },
                ].map(({ label, valor }) => (
                  <div key={label}>
                    <span className="block font-display text-xl font-extrabold text-text-primary">{valor}</span>
                    <span className="text-xs text-text-muted font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </Motion.div>

            {/* Menu lateral */}
            <Motion.div
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {[
                { icon: ShoppingBag, label: 'Meus pedidos', target: 'pedidos' },
                { icon: MapPin, label: 'Endereços salvos', target: 'enderecos' },
                { icon: Heart, label: 'Favoritos', target: null },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (!item.target) return
                      const el = document.getElementById(item.target)
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-none hover:bg-surface-2 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                      <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-text-muted" />
                  </button>
                )
              })}
              <button
                onClick={sair}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <LogOut size={16} className="text-red-400" />
                <span className="text-sm font-semibold text-red-400">Sair da conta</span>
              </button>
            </Motion.div>
          </div>

          {/* ── Coluna direita ── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Dados pessoais */}
            <SecaoCard titulo="Dados pessoais" delay={0.15}>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { Icon: User, label: 'Nome', valor: nome },
                  { Icon: Mail, label: 'E-mail', valor: usuario?.email || '—' },
                  { Icon: Phone, label: 'Telefone', valor: usuario?.telefone || 'Não informado' },
                ].map((item) => {
                  const Icon = item.Icon
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={15} className="text-text-muted" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-text-muted uppercase tracking-wide mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-text-primary">{item.valor}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SecaoCard>

            {/* Pedidos recentes */}
            <SecaoCard titulo="Pedidos recentes" delay={0.2} id="pedidos">
              <div className="divide-y divide-border">
                {carregando && (
                  <div className="px-5 py-6 text-sm text-text-muted font-semibold">Carregando pedidos...</div>
                )}
                {!carregando && pedidosFormatados.length === 0 && (
                  <div className="px-5 py-6 text-sm text-text-muted font-semibold">
                    Você ainda não fez pedidos.
                  </div>
                )}
                {pedidosFormatados.map((pedido, i) => (
                  <Motion.div key={pedido.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center text-2xl shrink-0">
                      {pedido.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display text-sm font-bold text-text-primary">{pedido.loja}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[pedido.status] || 'text-text-secondary bg-surface-2'}`}>{pedido.status}</span>
                      </div>
                      <p className="text-xs text-text-muted font-semibold truncate">{pedido.itens}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={10} />{pedido.data}</span>
                        <span className="font-display text-sm font-extrabold text-accent">R$ {Number(pedido.total || 0).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    {pedido.avaliacao ? (
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={12} fill={j < pedido.avaliacao ? '#FFBA08' : 'none'} stroke={j < pedido.avaliacao ? '#FFBA08' : '#ccc'} />
                        ))}
                      </div>
                    ) : (
                      <button className="text-xs font-bold text-primary border border-primary rounded-full px-3 py-1 hover:bg-primary-light transition-all cursor-pointer bg-transparent shrink-0">
                        Avaliar
                      </button>
                    )}
                  </Motion.div>
                ))}
              </div>
            </SecaoCard>

            {/* Endereços */}
            <SecaoCard titulo="Endereços salvos" delay={0.3} id="enderecos">
              <div className="divide-y divide-border">
                {carregando && (
                  <div className="px-5 py-6 text-sm text-text-muted font-semibold">Carregando endereços...</div>
                )}
                {!carregando && enderecos.length === 0 && (
                  <div className="px-5 py-6 text-sm text-text-muted font-semibold">
                    Nenhum endereço salvo ainda.
                  </div>
                )}
                {enderecos.map((end) => (
                  <div key={end.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display text-sm font-bold text-text-primary">{end.label}</span>
                        {end.principal && (
                          <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Principal</span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary font-medium">
                        {[end.rua, end.bairro].filter(Boolean).join(', ') || 'Endereço não informado'}
                      </p>
                      {end.cidade && <p className="text-xs text-text-muted font-medium">{end.cidade}</p>}
                    </div>
                    <EditarEndereco end={end} clienteId={clienteId} onSalvo={(novo) => setEnderecos(prev => prev.map(e => e.id === end.id ? { ...e, rua: novo } : e))} />
                  </div>
                ))}
                <div className="px-5 py-4">
                  <AdicionarEndereco clienteId={clienteId} onSalvo={(end) => setEnderecos(prev => [...prev, end])} />
                </div>
              </div>
            </SecaoCard>
          </div>
        </div>
      </main>

      <MobileNavBar />
    </div>
  )
}
