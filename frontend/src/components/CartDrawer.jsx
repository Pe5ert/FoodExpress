import styled from 'styled-components'
import { useCart } from '../contexts/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useEffect } from 'react';
 
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  backdrop-filter: blur(2px);
`;
 
const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: white;
  z-index: 1001;
  transform: translateX(${p => p.$open ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0,0,0,0.15);
`;
 
const DrawerHead = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
`;
 
const HeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
 
  .icon {
    width: 38px;
    height: 38px;
    background: var(--primary-light);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }
 
  h3 {
    font-family: 'Sora', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
  }
 
  span {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
  }
`;
 
const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  background: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #ccc; background: var(--surface-2); }
`;
 
const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
`;
 
const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  gap: 0.75rem;
  color: var(--text-muted);
 
  .emoji { font-size: 3rem; }
  h4 { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text-secondary); }
  p { font-size: 0.85rem; font-weight: 600; }
`;
 
const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
 
  &:last-child { border-bottom: none; }
`;
 
const ItemImg = styled.div`
  width: 56px;
  height: 56px;
  background: ${p => p.$bg || 'var(--surface-2)'};
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  border: 1px solid var(--border);
`;
 
const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
 
  h4 {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
 
  .price {
    font-family: 'Sora', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--primary);
  }
`;
 
const QtyControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
 
  button {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
    padding: 0;
 
    &:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
  }
 
  span {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--text-primary);
    min-width: 16px;
    text-align: center;
  }
`;
 
const RemoveBtn = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  transition: all 0.2s;
  flex-shrink: 0;
  &:hover { color: #FF4444; background: #fff5f5; }
`;
 
const FooterBox = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  background: white;
`;
 
const SubtotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
`;
 
const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
 
  span:first-child {
    font-family: 'Sora', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
  }
 
  span:last-child {
    font-family: 'Sora', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--primary);
  }
`;
 
const CheckoutBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
 
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(255,107,53,0.3);
  }
 
  &:disabled {
    background: var(--border);
    color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
 
export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, cartTotal } = useCart();
 
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);
 
  if (!isOpen) return null;
 
  return (
    <>
      <Overlay onClick={onClose} />
      <Drawer $open={isOpen}>
        <DrawerHead>
          <HeadLeft>
            <div className="icon"><ShoppingBag size={18} /></div>
            <div>
              <h3>Meu Carrinho</h3>
              <span>{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
            </div>
          </HeadLeft>
          <CloseBtn onClick={onClose}><X size={16} /></CloseBtn>
        </DrawerHead>
 
        <Body>
          {cartItems.length === 0 ? (
            <EmptyBox>
              <div className="emoji">🛒</div>
              <h4>Carrinho vazio</h4>
              <p>Adicione itens para fazer seu pedido</p>
            </EmptyBox>
          ) : (
            cartItems.map((item, i) => (
              <Item key={item.id}>
                <ItemImg>{item.emoji || '🍕'}</ItemImg>
                <ItemInfo>
                  <h4>{item.name}</h4>
                  <span className="price">R$ {item.price.toFixed(2)}</span>
                </ItemInfo>
                <RemoveBtn onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={15} />
                </RemoveBtn>
              </Item>
            ))
          )}
        </Body>
 
        <FooterBox>
          <SubtotalRow>
            <span>Subtotal</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </SubtotalRow>
          <SubtotalRow>
            <span>Taxa de entrega</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Grátis</span>
          </SubtotalRow>
          <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
          <TotalRow>
            <span>Total</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </TotalRow>
          <CheckoutBtn
            onClick={() => { alert('Ir para checkout!'); onClose(); }}
            disabled={cartItems.length === 0}
          >
            Finalizar pedido <ArrowRight size={18} />
          </CheckoutBtn>
        </FooterBox>
      </Drawer>
    </>
  );
}