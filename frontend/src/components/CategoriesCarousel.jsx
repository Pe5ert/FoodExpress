import {
  Utensils,
  ShoppingCart,
  Coffee,
  Pizza,
  Sandwich,
  Apple,
  Fish,
  IceCream,
  Beef,
  Salad,
} from 'lucide-react';
import { motion } from 'framer-motion';

const categorias = [
  { Icon: Utensils, nome: 'Restaurantes', bg: '#FFE8D6' },
  { Icon: ShoppingCart, nome: 'Mercados', bg: '#D6F5F2' },
  { Icon: Pizza, nome: 'Pizzas', bg: '#FFE0D6' },
  { Icon: Sandwich, nome: 'Lanches', bg: '#FFF3D6' },
  { Icon: Coffee, nome: 'Cafés', bg: '#EDD9C0' },
  { Icon: Fish, nome: 'Frutos do Mar', bg: '#D6E8FF' },
  { Icon: Apple, nome: 'Saudável', bg: '#D6FFDD' },
  { Icon: IceCream, nome: 'Sobremesas', bg: '#F5D6FF' },
  { Icon: Beef, nome: 'Churrasco', bg: '#FFD6D6' },
  { Icon: Salad, nome: 'Saladas', bg: '#D6FFE8' },
];

export default function CategoriesCarousel() {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex gap-3 pb-1 min-w-max">
        {categorias.map((cat, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-2 cursor-pointer min-w-18 p-2 rounded-xl group"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            whileTap={{ scale: 0.92 }}
          >
            <motion.div
              className="w-14 h-14 rounded-xl border border-border flex items-center justify-center"
              style={{ background: cat.bg }}
              whileHover={{ scale: 1.1, borderColor: '#FF6B35' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <cat.Icon
                size={22}
                className="text-[#555] group-hover:text-primary transition-colors"
              />
            </motion.div>
            <span className="text-[0.75rem] font-bold text-text-secondary text-center leading-tight group-hover:text-primary transition-colors">
              {cat.nome}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
