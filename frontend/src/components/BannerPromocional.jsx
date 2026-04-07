import { ArrowRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const banners = [
  {
    eyebrow: 'Promoção',
    titulo: 'Frete Grátis',
    desc: 'Na primeira compra acima de R$ 50',
    emoji: '🚀',
    bg: 'linear-gradient(135deg,#FF6B35,#e55a2b)',
  },
  {
    eyebrow: 'Oferta do dia',
    titulo: '30% OFF',
    desc: 'Em restaurantes selecionados hoje',
    emoji: '🎉',
    bg: 'linear-gradient(135deg,#1B998B,#14756a)',
  },
  {
    eyebrow: 'Novo',
    titulo: 'Mercados Open',
    desc: 'Hortifruti e bebidas em até 20min',
    emoji: '🛒',
    bg: 'linear-gradient(135deg,#2E294E,#1a1640)',
  },
];

export default function PromotionalBanner() {
  return (
    <div className="mt-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex gap-3 sm:gap-4 pb-1" style={{ minWidth: 'max-content' }}>
        {banners.map((b, i) => (
          <Motion.div
            key={i}
            className="shrink-0 w-70 sm:w-90 md:w-120 rounded-2xl p-5 sm:p-7 flex items-center justify-between gap-3 cursor-pointer relative overflow-hidden"
            style={{ background: b.bg }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 80%, transparent 30%, rgba(255,255,255,0.08) 50%)',
              }}
            />
            <div className="text-white flex-1 relative z-10">
              <div className="text-[0.7rem] font-extrabold tracking-widest uppercase opacity-80 mb-1">
                {b.eyebrow}
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold mb-1 leading-tight">
                {b.titulo}
              </h3>
              <p className="text-xs sm:text-sm opacity-85 font-semibold mb-3">{b.desc}</p>
              <Motion.div
                className="inline-flex items-center gap-1.5 bg-white/20 border border-white/25 text-white px-3 py-1.5 rounded-full text-xs font-bold"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.2 }}
              >
                Ver oferta <ArrowRight size={12} />
              </Motion.div>
            </div>
            <Motion.div
              className="text-4xl sm:text-5xl leading-none opacity-90 shrink-0 relative z-10 select-none"
              whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              {b.emoji}
            </Motion.div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
}
