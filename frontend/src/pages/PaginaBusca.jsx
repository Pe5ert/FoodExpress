import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Search, Star, Clock, Truck, X, SlidersHorizontal, MapPin } from 'lucide-react'
import Header from '../components/Header'
import MobileNavBar from '../components/MobileNavBar'
import { lojas, todosProdutos } from '../data/dadosLojas'
import { filtrosBusca } from '../data/DadosPagina'

// aqui e o back gelado - filtros fixos devem vir de backend ou configuração remota
const filtros = filtrosBusca

function LojaCard({ loja, index }) {
  const navigate = useNavigate()
  return (
    <Motion.div
      className="flex items-center gap-4 py-4 border-b border-border last:border-none cursor-pointer group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      onClick={() => navigate(`/loja/${loja.id}`)}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-105 transition-transform">
        {loja.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-display font-bold text-base text-text-primary group-hover:text-primary transition-colors">{loja.nome}</h3>
          {loja.superRestaurante && (
            <span className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Star size={9} fill="white" stroke="white" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-1.5">
          <Star size={11} fill="#FFBA08" stroke="#FFBA08" />
          <span className="text-text-primary font-bold">{loja.avaliacao}</span>
          <span>·</span>
          <span>{loja.categoria}</span>
          {loja.distancia && <><span>·</span><span className="text-accent">{loja.distancia}</span></>}
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
          <span className="flex items-center gap-1"><Clock size={11} className="text-accent" />{loja.tempoEntrega}</span>
          <span>·</span>
          <span className={loja.taxaEntrega === 'Grátis' ? 'text-accent font-bold' : ''}>{loja.taxaEntrega === 'Grátis' ? 'Grátis' : loja.taxaEntrega}</span>
        </div>
      </div>
    </Motion.div>
  )
}

function ProdutoCard({ produto, index }) {
  const navigate = useNavigate()
  return (
    <Motion.div
      className="flex items-center gap-4 py-4 border-b border-border last:border-none cursor-pointer group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      onClick={() => navigate(`/loja/${produto.loja.id}`)}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-105 transition-transform">
        {produto.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors mb-0.5 leading-snug">{produto.nome}</h3>
        <p className="text-xs text-text-secondary font-medium line-clamp-1 mb-1.5">{produto.desc}</p>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold text-accent">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>
          {produto.precoAnterior && (
            <span className="text-xs text-text-muted line-through">R$ {produto.precoAnterior.toFixed(2).replace('.', ',')}</span>
          )}
          <span className="text-xs text-text-muted">· {produto.loja.nome}</span>
        </div>
      </div>
    </Motion.div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)
  const [abaAtiva, setAbaAtiva] = useState('lojas')
  const [filtrosAtivos, setFiltrosAtivos] = useState([])

  const lojasResultado = useMemo(() => {
    if (!query.trim()) return lojas
    return lojas.filter(l =>
      l.nome.toLowerCase().includes(query.toLowerCase()) ||
      l.categoria.toLowerCase().includes(query.toLowerCase())
    ).filter(l => {
      if (filtrosAtivos.includes('Entrega Grátis') && l.taxaEntrega !== 'Grátis') return false
      if (filtrosAtivos.includes('Super Restaurante') && !l.superRestaurante) return false
      return true
    }).sort((a, b) => {
      if (filtrosAtivos.includes('Mais Avaliados')) return b.avaliacao - a.avaliacao
      if (filtrosAtivos.includes('Mais Próximos')) return parseFloat(a.distancia) - parseFloat(b.distancia)
      return 0
    })
  }, [query, filtrosAtivos])

  const produtosResultado = useMemo(() => {
    if (!query.trim()) return todosProdutos
    return todosProdutos.filter(p =>
      p.nome.toLowerCase().includes(query.toLowerCase()) ||
      p.desc?.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const toggleFiltro = (f) => {
    setFiltrosAtivos(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const handleBusca = (e) => {
    e.preventDefault()
    setSearchParams({ q: inputValue })
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      <main className="max-w-320 mx-auto px-4 sm:px-6 py-6">

        {/* Busca mobile */}
        <form onSubmit={handleBusca} className="md:hidden flex items-center bg-white border border-border rounded-full px-4 h-12 gap-2 mb-6 focus-within:border-primary transition-all shadow-sm">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input type="text" placeholder="Busque por item ou loja" value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
          />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(''); setSearchParams({}) }}
              className="text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer">
              <X size={15} />
            </button>
          )}
        </form>

        {/* Título */}
        {query ? (
          <Motion.h1
            className="font-display text-2xl font-extrabold text-text-primary mb-5"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          >
            Buscando por <span className="text-primary">"{query}"</span>
          </Motion.h1>
        ) : (
          <h1 className="font-display text-2xl font-extrabold text-text-primary mb-5">Explore tudo</h1>
        )}

        {/* Abas */}
        <div className="flex border-b border-border mb-4">
          {['lojas', 'itens'].map(aba => (
            <button key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-5 py-3 text-sm font-bold capitalize border-b-2 transition-all cursor-pointer bg-transparent ${
                abaAtiva === aba ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-primary'
              }`}
            >{aba === 'lojas' ? `Lojas (${lojasResultado.length})` : `Itens (${produtosResultado.length})`}</button>
          ))}
        </div>

        {/* Filtros */}
        {abaAtiva === 'lojas' && (
          <Motion.div
            className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 pb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          >
            {filtros.map(f => (
              <button key={f}
                onClick={() => toggleFiltro(f)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  filtrosAtivos.includes(f)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                }`}
              >
                {f}
                {filtrosAtivos.includes(f) && <X size={11} />}
              </button>
            ))}
            {filtrosAtivos.length > 0 && (
              <button onClick={() => setFiltrosAtivos([])}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border border-border text-text-muted hover:border-red-300 hover:text-red-400 cursor-pointer whitespace-nowrap bg-white transition-all">
                Limpar
              </button>
            )}
          </Motion.div>
        )}

        {/* Resultados */}
        <div className="bg-white rounded-2xl border border-border px-4 sm:px-6">
          {abaAtiva === 'lojas' ? (
            lojasResultado.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="text-5xl">🔍</div>
                <p className="font-display font-bold text-text-secondary">Nenhuma loja encontrada</p>
                <p className="text-sm text-text-muted">Tente outro termo ou remova os filtros</p>
              </div>
            ) : (
              lojasResultado.map((loja, i) => <LojaCard key={loja.id} loja={loja} index={i} />)
            )
          ) : (
            produtosResultado.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="text-5xl">🍽️</div>
                <p className="font-display font-bold text-text-secondary">Nenhum item encontrado</p>
              </div>
            ) : (
              produtosResultado.map((p, i) => <ProdutoCard key={`${p.loja.id}-${p.id}`} produto={p} index={i} />)
            )
          )}
        </div>
      </main>

      <MobileNavBar />
    </div>
  )
}
