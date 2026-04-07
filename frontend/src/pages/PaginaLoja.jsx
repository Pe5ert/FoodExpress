import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Star, Clock, Truck, Search, ArrowLeft, Plus, Minus, X, ShoppingBag, Users, MapPin, CreditCard, Calendar, ChevronDown, CheckCircle } from 'lucide-react'
import MobileNavBar from '../components/MobileNavBar'
import CartDrawer from '../components/GavetaCarrinho'
import { useCart } from '../contexts/CartContext'
import { lojas } from '../data/dadosLojas'


// ─── Modal produto ────────────────────────────────────────────────────────────
function ProdutoModal({ produto, loja, onClose }) {
  const [quantidade, setQuantidade] = useState(1)
  const [selecionados, setSelecionados] = useState({})
  const [comentario, setComentario] = useState('')
  const { adicionarItem } = useCart()

  const MAX_COMENTARIO = 140

  const handleOpcao = (tituloOpcional, opcaoId, max) => {
    setSelecionados(prev => {
      const atual = prev[tituloOpcional] || []
      if (max === 1) return { ...prev, [tituloOpcional]: [opcaoId] }
      if (atual.includes(opcaoId)) return { ...prev, [tituloOpcional]: atual.filter(id => id !== opcaoId) }
      if (atual.length >= max) return prev
      return { ...prev, [tituloOpcional]: [...atual, opcaoId] }
    })
  }

  const opcionaisValidos = produto.opcionais?.every(op => {
    if (!op.obrigatorio) return true
    return (selecionados[op.titulo] || []).length > 0
  }) ?? true

  const extraTotal = produto.opcionais?.reduce((acc, op) => {
    const ids = selecionados[op.titulo] || []
    return acc + ids.reduce((s, id) => {
      const opc = op.opcoes.find(o => o.id === id)
      return s + (opc?.preco || 0)
    }, 0)
  }, 0) || 0

  const precoFinal = (produto.preco + extraTotal) * quantidade

  const handleAdicionar = () => {
    adicionarItem({
      id: `${produto.id}-${JSON.stringify(selecionados)}`,
      name: produto.nome,
      price: produto.preco + extraTotal,
      emoji: produto.emoji,
      quantidade,
      comentario,
    })
    onClose()
  }

  return (
    <Motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-200 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Motion.div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Alça mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Layout desktop: lado a lado | mobile: empilhado */}
        <div className="flex flex-col sm:flex-row overflow-hidden flex-1 min-h-0">

          {/* Imagem — desktop fica na esquerda */}
          <div className="relative sm:w-72 h-52 sm:h-auto bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center text-8xl shrink-0">
            {produto.emoji}
            <button onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all shadow-sm">
              <X size={16} className="text-text-secondary" />
            </button>
          </div>

          {/* Conteúdo scrollável */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5">
                {/* Nome e info básica */}
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{produto.nome}</p>
                <h2 className="font-display text-xl font-extrabold text-text-primary mb-1 leading-tight hidden sm:block">{produto.nome}</h2>

                {produto.serve && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mb-2">
                    <Users size={12} /> Serve {produto.serve} {produto.serve === 1 ? 'pessoa' : 'pessoas'}
                  </div>
                )}
                <p className="text-sm text-text-secondary font-medium leading-relaxed mb-3">{produto.desc}</p>

                {/* Preço */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display text-2xl font-extrabold text-accent">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </span>
                  {produto.precoAnterior && (
                    <span className="text-sm text-text-muted line-through font-semibold">
                      R$ {produto.precoAnterior.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                {/* Info da loja */}
                <div className="flex items-center justify-between p-3 bg-surface-2 rounded-xl mb-5 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{loja.emoji}</span>
                    <span className="text-sm font-bold text-text-primary">{loja.nome}</span>
                    {loja.superRestaurante && (
                      <span className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Star size={9} fill="white" stroke="white" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                    <Star size={12} fill="#FFBA08" stroke="#FFBA08" />
                    {loja.avaliacao}
                  </div>
                </div>
                <div className="text-xs text-text-muted font-semibold mb-5 flex gap-3">
                  <span className="flex items-center gap-1"><Clock size={11} className="text-accent" />{loja.tempoEntrega}</span>
                  <span>·</span>
                  <span>{loja.taxaEntrega === 'Grátis' ? <span className="text-accent font-bold">Entrega Grátis</span> : loja.taxaEntrega}</span>
                </div>

                {/* Opcionais */}
                {produto.opcionais?.map(op => (
                  <div key={op.titulo} className="mb-5">
                    <div className="flex items-center justify-between bg-surface-2 px-4 py-3 rounded-xl mb-3 border border-border">
                      <div>
                        <p className="font-display font-bold text-sm text-text-primary">{op.titulo}</p>
                        <p className="text-xs text-text-muted font-semibold">Escolha {op.max === 1 ? '1 opção' : `até ${op.max} opções`}.</p>
                      </div>
                      {op.obrigatorio && (
                        <span className="text-xs font-extrabold bg-secondary text-white px-2 py-0.5 rounded-md tracking-wide">OBRIGATÓRIO</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 px-1">
                      {op.opcoes.map(opcao => {
                        const selecionado = (selecionados[op.titulo] || []).includes(opcao.id)
                        return (
                          <button key={opcao.id}
                            onClick={() => handleOpcao(op.titulo, opcao.id, op.max)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer text-left w-full ${
                              selecionado ? 'border-primary bg-primary-light' : 'border-border bg-white hover:border-border hover:bg-surface-2'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                selecionado ? 'border-primary bg-primary' : 'border-border'
                              }`}>
                                {selecionado && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className="text-sm font-semibold text-text-primary">{opcao.nome}</span>
                            </div>
                            {opcao.preco > 0 && (
                              <span className="text-sm font-bold text-accent">+ R$ {opcao.preco.toFixed(2).replace('.', ',')}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Comentário */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-display font-bold text-sm text-text-primary">Algum comentário?</label>
                    <span className="text-xs text-text-muted font-semibold">{comentario.length} / {MAX_COMENTARIO}</span>
                  </div>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value.slice(0, MAX_COMENTARIO))}
                    placeholder="Ex: tirar a cebola, maionese à parte etc."
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm font-medium text-text-primary bg-surface-2 outline-none resize-none transition-all focus:border-primary focus:bg-white placeholder:text-text-muted"
                  />
                </div>

                <button className="text-sm font-bold text-primary hover:underline cursor-pointer bg-transparent border-none mb-2">
                  Denunciar item
                </button>
              </div>
            </div>

            {/* Footer fixo */}
            <div className="px-5 py-4 border-t border-border bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-3 py-2.5">
                  <Motion.button onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center cursor-pointer text-text-secondary hover:border-primary hover:text-primary transition-all"
                    whileTap={{ scale: 0.85 }}><Minus size={14} /></Motion.button>
                  <span className="font-display text-lg font-extrabold text-text-primary w-5 text-center">{quantidade}</span>
                  <Motion.button onClick={() => setQuantidade(q => q + 1)}
                    className="w-7 h-7 rounded-full bg-primary border-none flex items-center justify-center cursor-pointer text-white hover:bg-primary-dark transition-all"
                    whileTap={{ scale: 0.85 }}><Plus size={14} /></Motion.button>
                </div>

                <Motion.button onClick={handleAdicionar} disabled={!opcionaisValidos}
                  className="flex-1 py-3.5 bg-primary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                  whileHover={opcionaisValidos ? { scale: 1.02 } : {}}
                  whileTap={opcionaisValidos ? { scale: 0.97 } : {}}
                >
                  Adicionar · R$ {precoFinal.toFixed(2).replace('.', ',')}
                </Motion.button>
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

// ─── Card produto ─────────────────────────────────────────────────────────────
function ProdutoCard({ produto, onAbrir, index }) {
  return (
    <Motion.div
      className="flex items-center gap-4 py-4 border-b border-border last:border-none cursor-pointer group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
      onClick={() => onAbrir(produto)}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-text-primary mb-1 group-hover:text-primary transition-colors leading-snug">{produto.nome}</h4>
        {produto.serve && (
          <div className="flex items-center gap-1 text-xs text-text-muted font-semibold mb-1.5">
            <Users size={11} /> Serve {produto.serve} pessoas
          </div>
        )}
        {produto.desc && (
          <p className="text-xs text-text-secondary font-medium leading-relaxed line-clamp-2 mb-2">{produto.desc}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-accent">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
          {produto.precoAnterior && (
            <span className="text-xs text-text-muted line-through font-semibold">R$ {produto.precoAnterior.toFixed(2).replace('.', ',')}</span>
          )}
        </div>
      </div>
      <Motion.div
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center text-4xl shrink-0 bg-linear-to-br from-orange-50 to-orange-100 relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
      >
        {produto.emoji}
        <div className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <Plus size={13} className="text-white" />
        </div>
      </Motion.div>
    </Motion.div>
  )
}

// ─── Sidebar info da loja ─────────────────────────────────────────────────────
function SidebarInfo({ loja }) {
  const [aba, setAba] = useState('sobre')

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex border-b border-border">
        {['sobre', 'horário', 'pagamento'].map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`flex-1 py-3.5 text-sm font-bold capitalize transition-all cursor-pointer border-b-2 bg-transparent ${
              aba === a ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-primary'
            }`}
          >{a.charAt(0).toUpperCase() + a.slice(1)}</button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {aba === 'sobre' && (
            <Motion.div key="sobre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-text-secondary font-medium leading-relaxed mb-4">{loja.sobre}</p>
              {loja.superRestaurante && (
                <div className="bg-surface-2 rounded-xl p-4 mb-4 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <Star size={16} fill="white" stroke="white" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-text-primary">Super-Restaurante</p>
                      <p className="text-xs text-text-muted font-medium">Selo pelo alto nível de qualidade</p>
                    </div>
                  </div>
                  {['Um dos mais pedidos da região', 'Entrega no tempo prometido', 'Muitas avaliações 5 estrelas'].map(item => (
                    <div key={item} className="flex items-center gap-2 mb-1.5 last:mb-0">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs font-semibold text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="font-display font-bold text-sm text-text-primary mb-2">Endereço</p>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">{loja.endereco}</p>
              </div>
            </Motion.div>
          )}

          {aba === 'horário' && (
            <Motion.div key="horario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display font-bold text-sm text-text-primary mb-3">Funcionamento</p>
              <div className="flex flex-col gap-3">
                {loja.horarios.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-none">
                    <span className="text-sm font-semibold text-text-secondary">{h.dia}</span>
                    <span className="text-sm font-bold text-text-primary">{h.horario}</span>
                  </div>
                ))}
              </div>
            </Motion.div>
          )}

          {aba === 'pagamento' && (
            <Motion.div key="pagamento" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display font-bold text-sm text-text-primary mb-3">Formas aceitas</p>
              <div className="flex flex-wrap gap-2">
                {loja.pagamentos.map(p => (
                  <div key={p} className="flex items-center gap-1.5 bg-surface-2 border border-border px-3 py-2 rounded-xl">
                    <CreditCard size={13} className="text-accent" />
                    <span className="text-xs font-bold text-text-primary">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-surface-2 border border-border rounded-xl">
                <p className="text-xs font-semibold text-text-muted">
                  Pedido mínimo: <span className="font-bold text-text-primary">{loja.pedidoMinimo}</span>
                </p>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function StorePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [produtoAberto, setProdutoAberto] = useState(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [navOculta, setNavOculta] = useState(false)
  const [ultimoScroll, setUltimoScroll] = useState(0)
  const [infoAberta, setInfoAberta] = useState(false)
  const categoriasRef = useRef({})
  const { quantidadeTotal } = useCart()

  const loja = lojas.find(l => l.id === Number(id)) || lojas[0]

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (atual) => {
    if (atual < 80) { setNavOculta(false) }
    else if (atual > ultimoScroll + 5) { setNavOculta(true) }
    else if (atual < ultimoScroll - 5) { setNavOculta(false) }
    setUltimoScroll(atual)
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setCategoriaAtiva(e.target.id) }),
      { rootMargin: '-20% 0px -70% 0px' }
    )
    Object.values(categoriasRef.current).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [loja])

  const categoriasFiltradas = loja.categorias
    .map(cat => ({
      ...cat,
      produtos: cat.produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.desc?.toLowerCase().includes(busca.toLowerCase())
      ),
    }))
    .filter(cat => cat.produtos.length > 0)

  const scrollParaCategoria = (catId) => {
    const el = categoriasRef.current[catId]
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 170
      window.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">

      {/* Navbar da loja */}
      <Motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm"
        animate={{ y: navOculta ? '-100%' : '0%' }}
        initial={false}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Motion.button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-border bg-transparent flex items-center justify-center cursor-pointer text-text-secondary hover:bg-surface-2 hover:text-primary transition-all shrink-0"
            whileTap={{ scale: 0.9 }}><ArrowLeft size={18} /></Motion.button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl">{loja.emoji}</span>
            <div className="min-w-0">
              <h1 className="font-display text-base font-extrabold text-text-primary truncate leading-tight">{loja.nome}</h1>
              <div className="flex items-center gap-3 text-xs text-text-muted font-semibold">
                <span className="flex items-center gap-1"><Star size={10} fill="#FFBA08" stroke="#FFBA08" />{loja.avaliacao}</span>
                <span className="flex items-center gap-1"><Clock size={10} className="text-accent" />{loja.tempoEntrega}</span>
                <span className="flex items-center gap-1"><Truck size={10} className="text-accent" />{loja.taxaEntrega}</span>
              </div>
            </div>
          </div>

          <Motion.button onClick={() => setCarrinhoAberto(true)}
            className="relative flex items-center gap-2 bg-transparent border border-border rounded-full py-2 pr-3 pl-2.5 cursor-pointer transition-all hover:border-primary hover:bg-primary-light shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-5 h-5 flex items-center justify-center text-text-primary">
              <ShoppingBag size={18} />
              <AnimatePresence>
                {quantidadeTotal > 0 && (
                  <Motion.span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-3.5 h-3.5 text-[0.55rem] font-extrabold flex items-center justify-center px-px border border-white"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500 }}
                  >{quantidadeTotal}</Motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="hidden sm:block text-xs font-bold text-text-primary">Carrinho</span>
          </Motion.button>
        </div>

        {/* Só as pills de categoria ficam no sticky navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
            {loja.categorias.map(cat => (
              <Motion.button key={cat.id} onClick={() => scrollParaCategoria(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  categoriaAtiva === cat.id ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                }`} whileTap={{ scale: 0.95 }}
              >{cat.nome}</Motion.button>
            ))}
          </div>
        </div>
      </Motion.div>

      {/* Espaçador — altura do sticky navbar para evitar que o conteúdo fique escondido atrás dela */}
      <div className="h-27" />

      {/* Banner */}
      <div className="relative w-full h-40 sm:h-56 bg-linear-to-br from-secondary to-secondary-light overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-[8rem] opacity-20 select-none">{loja.emoji}</div>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* ── Barra de info abaixo do banner ── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          {/* Linha 1: logo flutuante + nome + avaliação + ver mais + pedido mínimo */}
          <div className="flex items-center gap-4 mb-4">
            {/* Logo flutua sobre o banner */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 -mt-10 rounded-2xl bg-white border-2 border-border shadow-lg flex items-center justify-center text-4xl shrink-0 relative z-10">
              {loja.emoji}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary leading-tight">{loja.nome}</h2>
                {loja.superRestaurante && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <Star size={11} fill="white" stroke="white" />
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm font-extrabold text-yellow-500">
                  <Star size={14} fill="#FFBA08" stroke="#FFBA08" />
                  {loja.avaliacao}
                </div>
              </div>
              <p className="text-sm text-text-muted font-semibold">{loja.categoria}</p>
            </div>

            {/* Ver mais + pedido mínimo — desktop */}
            <div className="hidden md:flex items-center gap-4 shrink-0 pt-1">
              <button
                onClick={() => setInfoAberta(true)}
                className="text-sm font-bold text-primary cursor-pointer bg-transparent border-none hover:underline"
              >
                Ver mais
              </button>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5 text-sm text-text-muted font-semibold">
                <span className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs">$</span>
                Pedido mínimo {loja.pedidoMinimo}
              </div>
            </div>
          </div>

          {/* Linha 2: busca + entrega + horário */}
          <div className="flex gap-3 items-stretch">
            {/* Busca */}
            <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 h-11 focus-within:border-primary focus-within:bg-white transition-all">
              <Search size={15} className="text-primary shrink-0" />
              <input
                type="text"
                placeholder="Buscar no cardápio"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
              />
            </div>

            {/* Entrega */}
            <button className="hidden sm:flex items-center gap-2 px-4 h-11 bg-surface-2 border border-border rounded-xl text-sm font-bold text-text-primary cursor-pointer hover:border-primary transition-all whitespace-nowrap shrink-0">
              <Truck size={15} className="text-text-muted" />
              Entrega
              <ChevronDown size={14} className="text-text-muted" />
            </button>

            {/* Hoje / horário */}
            <div className="hidden sm:flex flex-col justify-center px-4 h-11 bg-surface-2 border border-border rounded-xl text-xs shrink-0">
              <span className="font-extrabold text-text-primary leading-tight">Hoje</span>
              <span className="text-text-muted font-semibold">{loja.tempoEntrega} · {loja.taxaEntrega === 'Grátis' ? 'Grátis' : loja.taxaEntrega}</span>
            </div>
          </div>

          {/* Ver mais mobile */}
          <button
            onClick={() => setInfoAberta(true)}
            className="md:hidden mt-2 text-sm font-bold text-primary cursor-pointer bg-transparent border-none hover:underline"
          >
            Ver mais informações
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {categoriasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="text-5xl">🔍</div>
            <h3 className="font-display text-lg font-bold text-text-secondary">Nenhum produto encontrado</h3>
          </div>
        ) : (
          categoriasFiltradas.map(cat => (
            <section key={cat.id} id={cat.id} ref={el => (categoriasRef.current[cat.id] = el)} className="mb-8 scroll-mt-48">
              <h2 className="font-display text-lg font-extrabold text-text-primary mb-2 pb-2 border-b-2 border-primary/20">{cat.nome}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-x-8">
                {cat.produtos.map((produto, i) => (
                  <ProdutoCard key={produto.id} produto={produto} onAbrir={setProdutoAberto} index={i} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <MobileNavBar />
      <CartDrawer isOpen={carrinhoAberto} onClose={() => setCarrinhoAberto(false)} />

      {/* Modal Ver mais */}
      <AnimatePresence>
        {infoAberta && (
          <Motion.div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-200 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInfoAberta(false)}
          >
            <Motion.div
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl overflow-hidden"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-display text-base font-extrabold text-text-primary">{loja.nome}</h3>
                <button onClick={() => setInfoAberta(false)}
                  className="w-8 h-8 rounded-full border border-border bg-transparent flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
                  <X size={15} className="text-text-secondary" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                <SidebarInfo loja={loja} />
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {produtoAberto && (
          <ProdutoModal produto={produtoAberto} loja={loja} onClose={() => setProdutoAberto(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
