import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { Home, Search, ShoppingBag, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNavBar() {
  const { estaLogado, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const location = useLocation();
  const logado = estaLogado || isLoggedIn;
  const ativo = (path) => location.pathname === path;

  const navItems = [
    { to: '/', label: 'Início', Icon: Home },
    { to: '/search', label: 'Buscar', Icon: Search },
  ];

  return (
    <>
      <motion.nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 flex justify-around items-center px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260, delay: 0.3 }}
      >
        {navItems.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${ativo(to) ? 'text-primary bg-primary-light' : 'text-text-muted'}`}
          >
            <motion.div whileTap={{ scale: 0.85 }}>
              <Icon size={22} />
            </motion.div>
            <span className="text-[0.65rem] font-bold">{label}</span>
          </Link>
        ))}

        {/* Botão carrinho */}
        <motion.button
          onClick={() => setCarrinhoAberto(true)}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-text-muted border-none bg-transparent cursor-pointer"
          whileTap={{ scale: 0.85 }}
        >
          <div className="relative">
            <ShoppingBag size={22} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-4 h-4 text-[0.6rem] font-extrabold flex items-center justify-center px-px border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[0.65rem] font-bold">Pedidos</span>
        </motion.button>

        {/* Perfil / Login */}
        {logado ? (
          <Link
            to="/perfil"
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${ativo('/perfil') ? 'text-primary bg-primary-light' : 'text-text-muted'}`}
          >
            <motion.div whileTap={{ scale: 0.85 }}>
              <User size={22} />
            </motion.div>
            <span className="text-[0.65rem] font-bold">Perfil</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${ativo('/login') ? 'text-primary bg-primary-light' : 'text-text-muted'}`}
          >
            <motion.div whileTap={{ scale: 0.85 }}>
              <LogIn size={22} />
            </motion.div>
            <span className="text-[0.65rem] font-bold">Entrar</span>
          </Link>
        )}
      </motion.nav>

      <CartDrawer isOpen={carrinhoAberto} onClose={() => setCarrinhoAberto(false)} />
    </>
  );
}
