import Header from '../components/Header'
import CategoriesCarousel from '../components/CategoriesCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Variante para stagger de filhos
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
}

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleBusca = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      {/* Hero */}
      <section className="relative bg-secondary px-4 pt-12 pb-20 overflow-hidden sm:px-6 sm:pt-14">
        <div className="absolute top-[-50%] right-[-20%] w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-2px] left-0 right-0 h-10 bg-background"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <motion.div
          className="max-w-175 mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/10 border border-primary/30 text-orange-200 px-4 py-1.5 rounded-full text-xs font-bold mb-5 tracking-wide">
            🔥 +500 estabelecimentos disponíveis
          </motion.div>

          <motion.h1 variants={itemVariants}
            className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            O que você quer<br />
            <span className="text-primary">comer hoje?</span>
          </motion.h1>

          <motion.p variants={itemVariants}
            className="text-base text-white/65 mb-8 font-medium px-4">
            Restaurantes e mercados perto de você • Entrega em até 30min
          </motion.p>

          <motion.form variants={itemVariants} onSubmit={handleBusca}
            className="flex items-center bg-white rounded-full pl-5 pr-1.5 py-1.5 shadow-2xl gap-3 max-w-135 mx-auto">
            <Search size={18} className="text-text-muted flex-shrink-0" />
            <input type="text" placeholder="Busque por restaurante ou prato..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="flex-1 border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal bg-transparent min-w-0"
            />
            <motion.button type="submit"
              className="bg-primary text-white border-none rounded-full px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <Search size={15} /><span className="hidden sm:inline">Buscar</span>
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="flex justify-center gap-8 mt-8 sm:gap-12">
            {[{ valor: '30min', label: 'Entrega média' }, { valor: '4.8★', label: 'Avaliação média' }, { valor: 'R$0', label: '1ª entrega' }].map(({ valor, label }) => (
              <div key={label} className="text-center">
                <span className="block font-display text-2xl font-extrabold text-white">{valor}</span>
                <span className="text-xs text-white/50 font-semibold">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Conteúdo */}
      <main className="max-w-320 mx-auto px-4 sm:px-6">
        <PromotionalBanner />

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between mt-10 mb-5"
        >
          <h2 className="font-display text-xl font-extrabold text-text-primary">Explorar categorias</h2>
        </motion.div>
        <CategoriesCarousel />

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between mt-10 mb-5"
        >
          <h2 className="font-display text-xl font-extrabold text-text-primary">🍽️ Restaurantes próximos</h2>
          <a href="/Restaurantes" className="text-sm text-primary font-bold hover:underline whitespace-nowrap ml-4">Ver todos</a>
        </motion.div>
        <StoreGrid />

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between mt-10 mb-5"
        >
          <h2 className="font-display text-xl font-extrabold text-text-primary">🛒 Mercados & Conveniência</h2>
          <a href="/Mercados" className="text-sm text-primary font-bold hover:underline whitespace-nowrap ml-4">Ver todos</a>
        </motion.div>
        <StoreGrid tipo="mercado" />
      </main>

      <MobileNavBar />
    </div>
  )
}
