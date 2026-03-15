import { Star, Clock, Truck, Heart } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const gradients = [
  'linear-gradient(135deg,#FFE0D0,#FFCAB4)',
  'linear-gradient(135deg,#D0F0EE,#B4E8E4)',
  'linear-gradient(135deg,#E0EAFF,#C8D8FF)',
  'linear-gradient(135deg,#FFF0D0,#FFE4AA)',
  'linear-gradient(135deg,#F0D0FF,#E4AAFF)',
]

export default function StoreCard({ loja, index = 0 }) {
  const [fav, setFav] = useState(false)

  const loja_ = {
    nome: loja?.nome || 'Restaurante Exemplo',
    categoria: loja?.categoria || 'Pizza • Italiana',
    avaliacao: loja?.avaliacao || 4.5,
    tempoEntrega: loja?.tempoEntrega || '30-40 min',
    taxaEntrega: loja?.taxaEntrega || 'R$ 5,00',
    emoji: loja?.emoji || '🍽️',
    promo: loja?.promo || null,
    fechado: loja?.fechado || false,
    gratis: loja?.taxaEntrega === 'Grátis' || loja?.gratis,
  }

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden border border-border cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', borderColor: 'transparent' }}
    >
      {/* Imagem */}
      <div
        className="relative w-full h-40 flex items-center justify-center text-5xl overflow-hidden"
        style={{ background: gradients[index % gradients.length] }}
      >
        <motion.span
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {loja_.emoji}
        </motion.span>

        {loja_.fechado && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="bg-white text-text-primary text-xs font-extrabold px-3 py-1.5 rounded-full tracking-wide">FECHADO</span>
          </div>
        )}

        {loja_.promo && (
          <motion.div
            className="absolute top-2.5 left-2.5 bg-primary text-white text-[0.72rem] font-extrabold px-2 py-1 rounded-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: index * 0.06 + 0.2 }}
          >
            {loja_.promo}
          </motion.div>
        )}

        <motion.button
          onClick={(e) => { e.stopPropagation(); setFav(f => !f) }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white border-none flex items-center justify-center shadow-sm cursor-pointer"
          whileTap={{ scale: 0.85 }}
          animate={{ scale: fav ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.25 }}
        >
          <Heart size={15} fill={fav ? '#FF4444' : 'none'} stroke={fav ? '#FF4444' : '#ccc'} />
        </motion.button>
      </div>

      {/* Corpo */}
      <div className="p-3 pb-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-display text-base font-bold text-text-primary leading-tight">{loja_.nome}</h3>
          <div className="flex items-center gap-1 text-xs font-extrabold text-text-primary flex-shrink-0">
            <Star size={12} fill="#FFBA08" stroke="#FFBA08" />
            {loja_.avaliacao}
          </div>
        </div>
        <p className="text-xs text-text-muted font-semibold mb-3">{loja_.categoria}</p>
        <div className="h-px bg-border mb-3" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Clock size={12} className="text-accent" />{loja_.tempoEntrega}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Truck size={12} className="text-accent" />
            {loja_.gratis ? <span className="text-accent font-extrabold">Grátis</span> : loja_.taxaEntrega}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
