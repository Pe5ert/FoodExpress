import { useState, useEffect, useCallback } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  ShoppingBag, UtensilsCrossed, Settings, Clock, CheckCircle,
  Truck, XCircle, Plus, DollarSign, Star, Package,
  ChevronRight, LogOut, Trash2, ToggleLeft, ToggleRight, Check
} from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'
import api from '../services/api'
import { formatarHoraBanco, mesmoDiaLocal } from '../utils/datas'

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig = {
  pendente:   { label: 'Pendente',   cor: 'text-secondary bg-secondary/8 border-secondary/20', Icon: Clock },
  confirmado: { label: 'Confirmado', cor: 'text-primary bg-primary-light border-primary/20',   Icon: Clock },
  preparando: { label: 'Preparando', cor: 'text-accent bg-accent/10 border-accent/20',         Icon: Clock },
  pronto:     { label: 'Pronto',     cor: 'text-accent bg-accent/10 border-accent/20',         Icon: CheckCircle },
  entregando: { label: 'Entregando', cor: 'text-secondary bg-secondary/8 border-secondary/20', Icon: Truck },
  entregue:   { label: 'Entregue',   cor: 'text-accent bg-accent/10 border-accent/20',         Icon: CheckCircle },
  cancelado:  { label: 'Cancelado',  cor: 'text-text-muted bg-surface-2 border-border',        Icon: XCircle },
}

const proximoStatus = { pendente: 'confirmado', confirmado: 'preparando', preparando: 'pronto' }

function numeroPedido(id) {
  return `#${String(id || '').replace(/^ped_/, '').slice(-6).toUpperCase()}`
}

function formatarMoeda(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',')
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

// ── Navbar ───────────────────────────────────────────────────────────────────
function NavbarRestaurante({ restaurante }) {
  const { sair } = useAuth()
  return (
    <header className="bg-secondary border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="FoodExpress" className="h-7" />
          <div className="h-5 w-px bg-white/20" />
          <div>
            <span className="text-white font-bold text-sm">{restaurante?.nome || 'Meu Restaurante'}</span>
            {restaurante?.status === 'ativo'
              ? <span className="ml-2 text-xs text-accent font-bold">● Ativo</span>
              : <span className="ml-2 text-xs text-yellow-400 font-bold">● Loja fechada</span>}
          </div>
        </div>
        <button onClick={sair} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors cursor-pointer bg-transparent border-none">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </header>
  )
}

// ── Aba Pedidos ───────────────────────────────────────────────────────────────
function AbaPedidos({ restauranteId, avaliacao }) {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(() => {
    if (!restauranteId) return
    setCarregando(true)
    api.pedidos.listar({ restauranteId })
      .then(dados => setPedidos(Array.isArray(dados) ? dados : []))
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [restauranteId])

  useEffect(() => { carregar() }, [carregar])

  const ativos = pedidos.filter(p => !['entregue', 'cancelado'].includes(p.status))
  const faturamentoHoje = pedidos
    .filter(p => p.status === 'entregue' && mesmoDiaLocal(p.created_at))
    .reduce((acc, p) => acc + Number(p.total), 0)

  const avancarStatus = async (pedidoId, proximo) => {
    try {
      await api.pedidos.atualizarStatus(pedidoId, proximo)
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: proximo } : p))
    } catch (e) {
      alert('Erro ao atualizar status: ' + e.message)
    }
  }

  if (carregando) return <div className="text-center py-16 text-text-muted font-semibold">Carregando pedidos...</div>

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pedidos ativos',   valor: ativos.length,                      Icon: Package,   cor: 'text-primary' },
          { label: 'Faturamento hoje', valor: `R$ ${formatarMoeda(faturamentoHoje)}`, Icon: DollarSign, cor: 'text-accent' },
          { label: 'Avaliação média',  valor: `${avaliacao ?? '—'} ★`,            Icon: Star,       cor: 'text-accent' },
        ].map(({ label, valor, Icon, cor }) => (
          <div key={label} className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={cor} />
              <p className="text-xs text-text-muted font-semibold">{label}</p>
            </div>
            <p className={`font-display text-2xl font-extrabold ${cor}`}>{valor}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-extrabold text-text-primary mb-4">Pedidos Recebidos</h2>
      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-text-muted font-semibold">Nenhum pedido ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido, i) => {
            const cfg = statusConfig[pedido.status] || statusConfig.pendente
            const proximo = proximoStatus[pedido.status]
            const itensTexto = formatarItensPedido(pedido.itens)

            return (
              <Motion.div key={pedido.id}
                className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-text-muted font-semibold">{numeroPedido(pedido.id)}</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5">{pedido.cliente_nome || pedido.cliente_id || 'Cliente'}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatarHoraBanco(pedido.created_at)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.cor}`}>
                    <cfg.Icon size={11} />{cfg.label}
                  </span>
                </div>
                {itensTexto && <p className="text-xs text-text-secondary font-semibold mb-1 truncate">🛍️ {itensTexto}</p>}
                {pedido.endereco_entrega && <p className="text-xs text-text-muted font-semibold mb-1">📍 {pedido.endereco_entrega}</p>}
                <p className="font-display text-xl font-extrabold text-primary mb-3">R$ {formatarMoeda(pedido.total)}</p>
                {proximo && (
                  <button
                    onClick={() => avancarStatus(pedido.id, proximo)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors cursor-pointer border-none"
                  >
                    Avançar → {statusConfig[proximo]?.label} <ChevronRight size={12} />
                  </button>
                )}
              </Motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Aba Cardápio ──────────────────────────────────────────────────────────────
function AbaCardapio({ restauranteId }) {
  const [cardapio, setCardapio] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '', categoria: '', descricao: '', tempo_preparo: '30', imagem: '' })
  const [sucesso, setSucesso] = useState(false)

  const carregar = useCallback(() => {
    if (!restauranteId) return
    setCarregando(true)
    api.cardapio.listar(restauranteId)
      .then(dados => setCardapio(Array.isArray(dados) ? dados : []))
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [restauranteId])

  useEffect(() => { carregar() }, [carregar])

  const carregarImagemArquivo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) setNovoItem(prev => ({ ...prev, imagem: String(reader.result) }))
    }
    reader.readAsDataURL(file)
  }

  const adicionarItem = async () => {
    if (!novoItem.nome.trim() || !novoItem.preco || !novoItem.categoria.trim()) {
      alert('Preencha nome, preço e categoria.')
      return
    }
    setSalvando(true)
    try {
      await api.cardapio.criar({
        restauranteId,
        nome: novoItem.nome,
        preco: parseFloat(novoItem.preco),
        categoria: novoItem.categoria,
        descricao: novoItem.descricao,
        imagem: novoItem.imagem,
        tempo_preparo: parseInt(novoItem.tempo_preparo) || 30,
      })
      setNovoItem({ nome: '', preco: '', categoria: '', descricao: '', tempo_preparo: '30', imagem: '' })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 2000)
      carregar()
    } catch (e) {
      alert('Erro ao adicionar item: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  const toggleDisponivel = async (item) => {
    try {
      await api.cardapio.atualizar(item.id, { disponivel: !item.disponivel })
      setCardapio(prev => prev.map(c => c.id === item.id ? { ...c, disponivel: !c.disponivel } : c))
    } catch (e) {
      alert('Erro ao alterar disponibilidade: ' + e.message)
    }
  }

  const removerItem = async (id) => {
    if (!confirm('Remover este item do cardápio?')) return
    try {
      await api.cardapio.remover(id)
      setCardapio(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      alert('Erro ao remover item: ' + e.message)
    }
  }

  return (
    <div>
      {/* Form adicionar */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <h3 className="font-display font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Adicionar Item
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { key: 'nome',          placeholder: 'Nome do item *' },
            { key: 'preco',         placeholder: 'Preço (ex: 29.90) *', type: 'number' },
            { key: 'categoria',     placeholder: 'Categoria (ex: Pizzas) *' },
            { key: 'tempo_preparo', placeholder: 'Tempo de preparo (min)', type: 'number' },
          ].map(({ key, placeholder, type = 'text' }) => (
            <input key={key} type={type} value={novoItem[key]} placeholder={placeholder}
              onChange={e => setNovoItem(prev => ({ ...prev, [key]: e.target.value }))}
              className="border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors"
            />
          ))}
          <input value={novoItem.descricao} placeholder="Descrição"
            onChange={e => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
            className="border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors sm:col-span-2"
          />
          <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={novoItem.imagem} placeholder="URL da imagem"
              onChange={e => setNovoItem(prev => ({ ...prev, imagem: e.target.value }))}
              className="border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors"
            />
            <label className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-bold text-text-secondary cursor-pointer hover:border-primary hover:text-primary">
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={carregarImagemArquivo} />
            </label>
          </div>
        </div>
        <button
          onClick={adicionarItem}
          disabled={salvando}
          className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm transition-colors cursor-pointer border-none disabled:opacity-60 ${sucesso ? 'bg-accent text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
        >
          {sucesso ? <><Check size={14} /> Adicionado!</> : salvando ? 'Salvando...' : <><Plus size={14} /> Adicionar Item</>}
        </button>
      </div>

      {/* Lista */}
      <h2 className="font-display text-xl font-extrabold text-text-primary mb-4">Cardápio</h2>
      {carregando ? (
        <div className="text-center py-12 text-text-muted font-semibold">Carregando cardápio...</div>
      ) : cardapio.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-text-muted font-semibold">Nenhum item no cardápio ainda.</p>
          <p className="text-xs text-text-muted font-semibold mt-2">Cadastre o primeiro produto para sua loja aparecer para os clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardapio.map((item, i) => (
            <Motion.div key={item.id}
              className="bg-white rounded-2xl border border-border shadow-sm p-5"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            >
              <div className="flex justify-between items-start mb-1">
                {item.imagem && <img src={item.imagem} alt={item.nome} className="mr-3 h-12 w-12 rounded-xl object-cover" />}
                <h4 className={`font-display font-extrabold text-sm ${item.disponivel ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                  {item.nome}
                </h4>
                <span className="text-accent font-extrabold text-sm">R$ {Number(item.preco).toFixed(2)}</span>
              </div>
              <p className="text-xs text-primary font-bold mb-1">{item.categoria}</p>
              {item.descricao && <p className="text-xs text-text-muted font-semibold mb-2">{item.descricao}</p>}
              {item.tempo_preparo > 0 && (
                <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                  <Clock size={11} /> {item.tempo_preparo} min
                </p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => toggleDisponivel(item)}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    item.disponivel
                      ? 'text-accent bg-accent/10 border-accent/20 hover:bg-accent/20'
                      : 'text-text-muted bg-surface-2 border-border'
                  }`}
                >
                  {item.disponivel ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {item.disponivel ? 'Disponível' : 'Inativo'}
                </button>
                <button
                  onClick={() => removerItem(item.id)}
                  className="ml-auto w-7 h-7 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all text-text-secondary"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Aba Perfil ────────────────────────────────────────────────────────────────
function AbaPerfil({ restaurante }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 max-w-lg">
      <h2 className="font-display text-xl font-extrabold text-text-primary mb-5 flex items-center gap-2">
        <Settings size={18} className="text-primary" /> Dados do Restaurante
      </h2>
      <div className="flex flex-col gap-3">
        {[
          { label: 'Nome',      valor: restaurante?.nome },
          { label: 'E-mail',    valor: restaurante?.email },
          { label: 'Endereço',  valor: restaurante?.endereco },
          { label: 'Categoria', valor: restaurante?.categoria },
          { label: 'Status',    valor: restaurante?.status },
          { label: 'Comissão',  valor: `${restaurante?.taxa_comissao ?? '—'}%` },
          { label: 'Avaliação', valor: `${restaurante?.avaliacao_media ?? '—'} ★` },
        ].map(({ label, valor }) => (
          <div key={label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
            <span className="text-sm text-text-muted font-semibold">{label}</span>
            <span className="text-sm font-bold text-text-primary">{valor || '—'}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-5">Dados operacionais podem ser ajustados no painel. Para trocar CNPJ ou comissão, fale com o suporte.</p>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PainelRestaurante() {
  const { usuario } = useAuth()
  const [aba, setAba] = useState('pedidos')
  const [restaurante, setRestaurante] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const email = usuario?.email || JSON.parse(localStorage.getItem('usuario') || '{}')?.email
    if (!email) { setCarregando(false); return }

    api.restaurantes.meuRestaurante()
      .then(rest => setRestaurante(rest))
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [usuario])

  const pedidosAtivosCount = 0 // contagem local — AbaPedidos gerencia seu próprio estado

  const abas = [
    { id: 'pedidos',  label: 'Pedidos',  Icon: ShoppingBag },
    { id: 'cardapio', label: 'Cardápio', Icon: UtensilsCrossed },
    { id: 'perfil',   label: 'Dados',    Icon: Settings },
  ]

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-muted font-semibold">Carregando painel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarRestaurante restaurante={restaurante} />

      {/* Abas */}
      <div className="bg-white border-b border-border sticky top-[52px] z-30">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {abas.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setAba(id)}
              className={`flex items-center gap-2 py-4 px-4 border-b-2 text-sm font-bold transition-colors cursor-pointer bg-transparent ${
                aba === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Motion.div key={aba} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {aba === 'pedidos'  && <AbaPedidos restauranteId={restaurante?.id} avaliacao={restaurante?.avaliacao_media} />}
            {aba === 'cardapio' && <AbaCardapio restauranteId={restaurante?.id} />}
            {aba === 'perfil'   && <AbaPerfil restaurante={restaurante} />}
          </Motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
