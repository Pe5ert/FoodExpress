import Header from '../components/Header'
import CategoriesCarousel from '../components/CarrosselCategorias'
import PromotionalBanner from '../components/BannerPromocional'
import StoreGrid from '../components/GradeLojas'
import MobileNavBar from '../components/MobileNavBar'
import Rodape from '../components/Rodape'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [deveAnimar] = useState(() => {
    if (typeof window === 'undefined') return true
    if (window.__homeHeroJaAnimou) return false
    window.__homeHeroJaAnimou = true
    return true
  })

  const handleBusca = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative bg-secondary px-4 pt-12 pb-20 overflow-hidden sm:px-6 sm:pt-14">
        <div className="absolute top-[-50%] right-[-20%] w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <Motion.div className="max-w-175 mx-auto text-center relative z-10"
          variants={containerVariants}
          initial={deveAnimar ? 'hidden' : 'show'}
          animate="show">
          <Motion.div variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/10 border border-primary/30 text-orange-200 px-4 py-1.5 rounded-full text-xs font-bold mb-5 tracking-wide">
            🔥 +500 estabelecimentos disponíveis
          </Motion.div>
          <Motion.h1 variants={itemVariants}
            className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            O que você quer<br /><span className="text-primary">comer hoje?</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="text-base text-white/65 mb-8 font-medium px-4">
            Restaurantes e mercados perto de você • Entrega em até 30min
          </Motion.p>
          <Motion.form variants={itemVariants} onSubmit={handleBusca}
            className="flex items-center bg-white rounded-full pl-5 pr-1.5 py-1.5 shadow-2xl gap-3 max-w-135 mx-auto">
            <Search size={18} className="text-text-muted shrink-0" />
            <input type="text" placeholder="Busque por restaurante ou prato..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="flex-1 border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal bg-transparent min-w-0" />
            <Motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-primary text-white border-none rounded-full px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
              <Search size={15} /><span className="hidden sm:inline">Buscar</span>
            </Motion.button>
          </Motion.form>
          <Motion.div variants={itemVariants} className="flex justify-center gap-8 mt-8 sm:gap-12">
            {[{ valor: '30min', label: 'Entrega média' }, { valor: '4.8★', label: 'Avaliação média' }, { valor: 'R$0', label: '1ª entrega' }].map(({ valor, label }) => (
              <div key={label} className="text-center">
                <span className="block font-display text-2xl font-extrabold text-white">{valor}</span>
                <span className="text-xs text-white/50 font-semibold">{label}</span>
              </div>
            ))}
          </Motion.div>
        </Motion.div>
      </section>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-24 md:pb-8">
        <PromotionalBanner />
        <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between mt-10 mb-5">
          <h2 className="font-display text-xl font-extrabold text-text-primary">Explorar categorias</h2>
        </Motion.div>
        <CategoriesCarousel />
        <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between mt-10 mb-5">
          <h2 className="font-display text-xl font-extrabold text-text-primary">🍽️ Restaurantes próximos</h2>
          <Link to="/Restaurantes" className="text-sm text-primary font-bold hover:underline whitespace-nowrap ml-4">Ver todos</Link>
        </Motion.div>
        <StoreGrid />
        <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between mt-10 mb-5">
          <h2 className="font-display text-xl font-extrabold text-text-primary">🛒 Mercados & Conveniência</h2>
          <Link to="/Mercados" className="text-sm text-primary font-bold hover:underline whitespace-nowrap ml-4">Ver todos</Link>
        </Motion.div>
        <StoreGrid tipo="mercado" />
      </main>

      <Rodape />
      <MobileNavBar />
    </div>
  )
}
