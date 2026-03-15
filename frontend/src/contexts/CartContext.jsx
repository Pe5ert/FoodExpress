import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carrinhoPersistido = localStorage.getItem('carrinho');
    if (carrinhoPersistido) {
      setItens(JSON.parse(carrinhoPersistido));
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens));
  }, [itens]);

  const adicionarItem = (item) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.id === item.id);
      if (existente) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  };

  const removerItem = (id) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  const limparCarrinho = () => setItens([]);

  const quantidadeTotal = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const totalCarrinho = itens.reduce(
    (soma, item) => soma + (item.preco || item.price || 0) * item.quantidade,
    0
  );

  // aliases em inglês para compatibilidade com componentes existentes
  const cartCount = quantidadeTotal;
  const cartItems = itens;
  const cartTotal = totalCarrinho;
  const removeFromCart = removerItem;
  const addToCart = adicionarItem;

  const valor = {
    itens,
    adicionarItem,
    removerItem,
    limparCarrinho,
    quantidadeTotal,
    totalCarrinho,
    carregando,
    cartCount,
    cartItems,
    cartTotal,
    removeFromCart,
    addToCart,
  };

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
};
