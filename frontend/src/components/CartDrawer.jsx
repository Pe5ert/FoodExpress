import { useCart } from '../contexts/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handle);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-100"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Mobile: bottom sheet | Desktop: side drawer */}
          <motion.div
            className="fixed z-101 bg-white flex flex-col
              bottom-0 left-0 right-0 w-full rounded-t-3xl max-h-[90dvh]
              md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-100 md:max-h-none md:rounded-none
              shadow-[0_-4px_40px_rgba(0,0,0,0.15)] md:shadow-[-8px_0_40px_rgba(0,0,0,0.15)]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            // No desktop, anima da direita
            style={{}}
          >
            {/* Versão desktop — sobrescreve animação para vir da direita */}
            <style>{`
              @media (min-width: 768px) {
                .cart-drawer-inner {
                  transform: none !important;
                }
              }
            `}</style>

            {/* Alça — só mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                  <ShoppingBag size={17} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary leading-tight">
                    Meu Carrinho
                  </h3>
                  <span className="text-xs text-text-muted font-semibold">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 border border-border rounded-full bg-transparent flex items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-surface-2"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
              {cartItems.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="text-5xl">🛒</div>
                  <h4 className="font-display text-base font-bold text-text-secondary">
                    Carrinho vazio
                  </h4>
                  <p className="text-sm font-semibold text-text-muted">
                    Adicione itens para fazer seu pedido
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 py-3.5 border-b border-border last:border-none"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <div className="w-12 h-12 bg-surface-2 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-border">
                        {item.emoji || '🍕'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-text-primary mb-0.5 truncate">
                          {item.name}
                        </h4>
                        <span className="font-display text-sm font-bold text-primary">
                          R$ {(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 border-none bg-transparent text-text-muted cursor-pointer flex items-center justify-center rounded-md hover:text-red-500 hover:bg-red-50 shrink-0"
                        whileTap={{ scale: 0.85 }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <motion.div
              className="px-5 py-4 border-t border-border bg-white shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-1.5 text-sm font-semibold text-text-secondary">
                <span>Subtotal</span>
                <span>R$ {(cartTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3 text-sm font-semibold text-text-secondary">
                <span>Taxa de entrega</span>
                <span className="text-accent font-bold">Grátis</span>
              </div>
              <div className="h-px bg-border mb-3" />
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-base font-bold text-text-primary">Total</span>
                <span className="font-display text-xl font-extrabold text-primary">
                  R$ {(cartTotal || 0).toFixed(2)}
                </span>
              </div>
              <motion.button
                onClick={() => {
                  alert('Ir para checkout!');
                  onClose();
                }}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-primary text-white border-none rounded-xl font-display text-base font-bold cursor-pointer flex items-center justify-center gap-2 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(255,107,53,0.35)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                Finalizar pedido <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
