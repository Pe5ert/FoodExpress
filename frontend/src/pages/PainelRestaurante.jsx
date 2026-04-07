import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, UtensilsCrossed, Settings, Clock, CheckCircle,
  Truck, XCircle, Plus, DollarSign, Star, TrendingUp, Package,
  ChevronRight, AlertCircle, LogOut
} from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'
import NavBarFuncionario from '../components/NavBarFuncionario'

// ── Dados de exemplo (back gelado — substituir por fetch da API) ────────────
const restauranteExemplo = {
  nome: 'Pizzaria FoodExpress',
  categoria: 'Pizzas & Massas',
  status: 'ativo',
  avaliacao_media: 4.7,
  taxa_comissao: 15,
}

const pedidosExemplo = [
  { id: 'ped_001', status: 'pendente',   total: 52.90, created_at: new Date().toISOString(), endereco_entrega: 'Rua das Flores, 123' },
  { id: 'ped_002', status: 'preparando', total: 38.00, created_at: new Date().toISOString(), endereco_entrega: 'Av. Beira Mar, 456' },
  { id: 'ped_003', status: 'entregue',   total: 27.50, created_at: new Date(Date.now() - 3600000).toISOString(), endereco_entrega: 'Rua Nogueira, 99' },
]

const cardapioExemplo = [
  { id: 1, nome: 'Pizza Margherita', preco: 32.90, categoria: 'Pizzas', descricao: 'Molho, mussarela e manjericão', tempo_preparo: 25 },
  { id: 2, nome: 'Pizza Pepperoni',  preco: 39.90, categoria: 'Pizzas', descricao: 'Molho, mussarela e pepperoni',  tempo_preparo: 25 },
  { id: 3, nome: 'Refrigerante 2L',  preco: 12.00, categoria: 'Bebidas', descricao: 'Coca-Cola ou Guaraná',         tempo_preparo: 0  },
]

// ── Helpers ─────────────────────────────────────────────────────────────────
const statusConfig = {
  pendente:   { label: 'Pendente',   cor: 'text-secondary bg-secondary/8 border-secondary/20', Icon: Clock },
  confirmado: { label: 'Confirmado', cor: 'text-primary bg-primary-light border-primary/20', Icon: Clock },
  preparando: { label: 'Preparando', cor: 'text-accent bg-accent/10 border-accent/20',  Icon: Clock },
  pronto:     { label: 'Pronto',     cor: 'text-accent bg-accent/10 border-accent/20',   Icon: CheckCircle },
  entregando: { label: 'Entregando', cor: 'text-secondary bg-secondary/8 border-secondary/20', Icon: Truck },
  entregue:   { label: 'Entregue',   cor: 'text-accent bg-accent/10 border-accent/20',        Icon: CheckCircle },
  cancelado:  { label: 'Cancelado',  cor: 'text-text-muted bg-surface-2 border-border',            Icon: XCircle },
}

const proximoStatus = { pendente: 'confirmado', confirmado: 'preparando', preparando: 'pronto' }

function NavbarRestaurante({ restaurante }) {
  const { sair } = useAuth()
  return (
    <header className="bg-secondary border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="FoodExpress" className="h-7" />
          <div className="h-5 w-px bg-white/20" />
          <div>
            <span className="text-white font-bold text-sm">{restaurante?.nome}</span>
            {restaurante?.status === 'ativo'
              ? <span className="ml-2 text-xs text-accent font-bold">● Ativo</span>
              : <span className="ml-2 text-xs text-secondary font-bold">⏳ Aguardando aprovação</span>}
          </div>
        </div>
        <button onClick={sair} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </header>
  )
}

// ── Aba Pedidos ──────────────────────────────────────────────────────────────
function AbaPedidos({ pedidos }) {
  const ativos = pedidos.filter(p => !['entregue', 'cancelado'].includes(p.status))
  const faturamentoHoje = pedidos
    .filter(p => p.status === 'entregue' && new Date(p.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, p) => acc + Number(p.total), 0)

  return (
    <div>
      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pedidos ativos',    valor: ativos.length,                          Icon: Package,     cor: 'text-primary' },
          { label: 'Faturamento hoje',  valor: `R$ ${faturamentoHoje.toFixed(2)}`,     Icon: DollarSign,  cor: 'text-accent' },
          { label: 'Avaliação média',   valor: `${restauranteExemplo.avaliacao_media} ★`, Icon: Star,     cor: 'text-accent' },
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
            return (
              <Motion.div key={pedido.id}
                className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-text-muted font-semibold">#{String(pedido.id).slice(-6)}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.cor}`}>
                    <cfg.Icon size={11} />{cfg.label}
                  </span>
                </div>
                <p className="text-sm text-text-muted font-semibold mb-1">📍 {pedido.endereco_entrega}</p>
                <p className="font-display text-xl font-extrabold text-primary mb-3">R$ {Number(pedido.total).toFixed(2)}</p>
                {proximo && (
                  <button className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
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

// ── Aba Cardápio ─────────────────────────────────────────────────────────────
function AbaCardapio({ cardapio }) {
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '', categoria: '', descricao: '', tempo_preparo: '30' })

  return (
    <div>
      {/* Form adicionar */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <h3 className="font-display font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Adicionar Item
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { key: 'nome',        placeholder: 'Nome do item *' },
            { key: 'preco',       placeholder: 'Preço (ex: 29.90) *', type: 'number' },
            { key: 'categoria',   placeholder: 'Categoria (ex: Pizzas) *' },
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
        </div>
        <button className="bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors">
          Adicionar Item
        </button>
      </div>

      {/* Lista */}
      <h2 className="font-display text-xl font-extrabold text-text-primary mb-4">Cardápio</h2>
      {cardapio.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-text-muted font-semibold">Nenhum item no cardápio ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardapio.map((item, i) => (
            <Motion.div key={item.id}
              className="bg-white rounded-2xl border border-border shadow-sm p-5"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-display font-extrabold text-text-primary text-sm">{item.nome}</h4>
                <span className="text-accent font-extrabold text-sm">R$ {Number(item.preco).toFixed(2)}</span>
              </div>
              <p className="text-xs text-primary font-bold mb-1">{item.categoria}</p>
              {item.descricao && <p className="text-xs text-text-muted font-semibold">{item.descricao}</p>}
              {item.tempo_preparo > 0 && (
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <Clock size={11} /> {item.tempo_preparo} min
                </p>
              )}
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Aba Perfil ───────────────────────────────────────────────────────────────
function AbaPerfil({ restaurante }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 max-w-lg">
      <h2 className="font-display text-xl font-extrabold text-text-primary mb-5 flex items-center gap-2">
        <Settings size={18} className="text-primary" /> Dados do Restaurante
      </h2>
      <div className="flex flex-col gap-3">
        {[
          { label: 'Nome',       valor: restaurante?.nome },
          { label: 'Categoria',  valor: restaurante?.categoria },
          { label: 'Status',     valor: restaurante?.status },
          { label: 'Comissão',   valor: `${restaurante?.taxa_comissao}%` },
          { label: 'Avaliação',  valor: `${restaurante?.avaliacao_media} ★` },
        ].map(({ label, valor }) => (
          <div key={label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
            <span className="text-sm text-text-muted font-semibold">{label}</span>
            <span className="text-sm font-bold text-text-primary">{valor}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-5">Para atualizar os dados, entre em contato com o operador.</p>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function PainelRestaurante() {
  const [aba, setAba] = useState('pedidos')
  const pedidosAtivos = pedidosExemplo.filter(p => !['entregue', 'cancelado'].includes(p.status))

  const abas = [
    { id: 'pedidos',  label: `Pedidos${pedidosAtivos.length > 0 ? ` (${pedidosAtivos.length})` : ''}`, Icon: ShoppingBag },
    { id: 'cardapio', label: 'Cardápio',   Icon: UtensilsCrossed },
    { id: 'perfil',   label: 'Dados',      Icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavbarRestaurante restaurante={restauranteExemplo} />

      {/* Abas */}
      <div className="bg-white border-b border-border sticky top-[52px] z-30">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {abas.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setAba(id)}
              className={`flex items-center gap-2 py-4 px-4 border-b-2 text-sm font-bold transition-colors ${
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
            {aba === 'pedidos'  && <AbaPedidos pedidos={pedidosExemplo} />}
            {aba === 'cardapio' && <AbaCardapio cardapio={cardapioExemplo} />}
            {aba === 'perfil'   && <AbaPerfil restaurante={restauranteExemplo} />}
          </Motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
