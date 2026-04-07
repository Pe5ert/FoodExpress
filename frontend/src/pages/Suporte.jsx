import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import MobileNavBar from '../components/MobileNavBar'
import {
  ArrowLeft, MessageCircle, Plus, Send, CheckCircle,
  Clock, AlertCircle, HelpCircle, ChevronRight
} from 'lucide-react'

// ── Dados de exemplo (back gelado — substituir por fetch /api/tickets) ───────
const ticketsExemplo = [
  {
    id: 1,
    titulo: 'Pedido não chegou',
    descricao: 'Realizei um pedido mas ele não chegou até agora.',
    categoria: 'pedido',
    status: 'resolvido',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

const categorias = [
  { id: 'pedido',    nome: 'Problema com Pedido' },
  { id: 'entrega',   nome: 'Problema com Entrega' },
  { id: 'pagamento', nome: 'Problema de Pagamento' },
  { id: 'conta',     nome: 'Problema com Conta' },
  { id: 'outro',     nome: 'Outro' },
]

const statusConfig = {
  aberto:          { label: 'Aberto',          cor: 'text-primary bg-primary-light border-primary/20', Icon: Clock },
  em_atendimento:  { label: 'Em atendimento',  cor: 'text-secondary bg-secondary/8 border-secondary/20',       Icon: MessageCircle },
  resolvido:       { label: 'Resolvido',       cor: 'text-accent bg-accent/10 border-accent/20',      Icon: CheckCircle },
  fechado:         { label: 'Fechado',          cor: 'text-text-muted bg-surface-2 border-border',     Icon: CheckCircle },
}

export default function Suporte() {
  const [aba, setAba] = useState('tickets')
  const [tickets] = useState(ticketsExemplo)
  const [novoTicket, setNovoTicket] = useState({ titulo: '', descricao: '', categoria: 'outro' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async () => {
    if (!novoTicket.titulo || !novoTicket.descricao) return
    setEnviando(true)
    // fetch('/api/tickets', { method: 'POST', ... })
    await new Promise(r => setTimeout(r, 800)) // simula request
    setEnviando(false)
    setEnviado(true)
    setNovoTicket({ titulo: '', descricao: '', categoria: 'outro' })
    setAba('tickets')
    setTimeout(() => setEnviado(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Voltar */}
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary mb-6 hover:text-primary/80 transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-2 flex items-center gap-2">
          <MessageCircle size={22} className="text-primary" /> Suporte
        </h1>
        <p className="text-sm text-text-muted font-semibold mb-6">Respondemos em até 24h por aqui.</p>

        {/* Toast enviado */}
        <AnimatePresence>
          {enviado && (
            <Motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent font-bold text-sm px-4 py-3 rounded-2xl mb-5"
            >
              <CheckCircle size={16} /> Ticket criado com sucesso! Entraremos em contato em breve.
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Abas */}
        <div className="bg-white border-b border-border rounded-t-2xl">
          <div className="flex gap-1 px-2">
            {[
              { id: 'tickets', label: `Meus Tickets (${tickets.length})`, Icon: HelpCircle },
              { id: 'novo',    label: 'Novo Ticket',                       Icon: Plus },
            ].map(({ id, label, Icon }) => (
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

        <AnimatePresence mode="wait">
          {aba === 'tickets' ? (
            <Motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {tickets.length === 0 ? (
                <div className="bg-white rounded-b-2xl border-x border-b border-border p-12 text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-text-muted font-semibold mb-4">Nenhum ticket aberto ainda.</p>
                  <button onClick={() => setAba('novo')}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors">
                    Criar Ticket
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-b-2xl border-x border-b border-border divide-y divide-border overflow-hidden">
                  {tickets.map((ticket, i) => {
                    const cfg = statusConfig[ticket.status] || statusConfig.aberto
                    return (
                      <Motion.div key={ticket.id}
                        className="p-5 hover:bg-surface-2 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-xs text-text-muted font-semibold mb-0.5">Ticket #{ticket.id}</p>
                            <h3 className="font-bold text-text-primary text-sm">{ticket.titulo}</h3>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ml-3 ${cfg.cor}`}>
                            <cfg.Icon size={11} />{cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted font-semibold mb-3">{ticket.descricao}</p>
                        <div className="flex justify-between text-xs text-text-muted font-semibold">
                          <span className="capitalize">{categorias.find(c => c.id === ticket.categoria)?.nome ?? ticket.categoria}</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </Motion.div>
                    )
                  })}
                </div>
              )}
            </Motion.div>
          ) : (
            <Motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-b-2xl border-x border-b border-border p-6">
                <h2 className="font-display font-extrabold text-text-primary mb-5">Criar Novo Ticket</h2>

                {/* Categoria */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-text-primary mb-2">Categoria</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categorias.map(cat => (
                      <button key={cat.id} onClick={() => setNovoTicket(p => ({ ...p, categoria: cat.id }))}
                        className={`text-xs font-bold py-2 px-3 rounded-xl border transition-colors ${
                          novoTicket.categoria === cat.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'
                        }`}>
                        {cat.nome}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assunto */}
                <div className="mb-5">
                  <label className="block text-sm font-bold text-text-primary mb-2">Assunto</label>
                  <input
                    type="text"
                    value={novoTicket.titulo}
                    onChange={e => setNovoTicket(p => ({ ...p, titulo: e.target.value }))}
                    placeholder="Resumo do problema..."
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Descrição */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-text-primary mb-2">Descrição</label>
                  <textarea
                    value={novoTicket.descricao}
                    onChange={e => setNovoTicket(p => ({ ...p, descricao: e.target.value }))}
                    placeholder="Descreva o problema em detalhes..."
                    rows={4}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-primary outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={enviar}
                  disabled={!novoTicket.titulo || !novoTicket.descricao || enviando}
                  className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Enviando...' : <><Send size={14} /> Enviar Ticket</>}
                </button>
              </div>

              {/* Info */}
              <div className="mt-4 bg-surface-2 border border-border rounded-2xl p-5">
                <h4 className="font-bold text-secondary text-sm mb-1 flex items-center gap-2">
                  <AlertCircle size={14} /> Tempo de resposta
                </h4>
                <p className="text-xs text-text-secondary font-semibold">
                  Respondemos em até 24 horas. Você receberá um e-mail com as atualizações.
                </p>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNavBar />
    </div>
  )
}
