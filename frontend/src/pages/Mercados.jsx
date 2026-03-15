import Header from '../components/Header'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'
import Footer from '../components/footer'
import { motion } from 'framer-motion'

export default function Mercados() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 pb-24 md:pb-8 flex-1">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-6">
          🛒 Mercados
        </motion.h1>
        <StoreGrid tipo="mercado" />
      </main>
      <Footer />
      <MobileNavBar />
    </div>
  )
}
