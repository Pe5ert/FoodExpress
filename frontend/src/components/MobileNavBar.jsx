import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import CartDrawer from './CartDrawer'
import { Home, Search, ShoppingBag, User, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
 
const Nav = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -1px 0 var(--border), 0 -4px 20px rgba(0,0,0,0.06);
  z-index: 200;
  padding: 0.5rem 0.25rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
 
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
`;
 
const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md);
  color: ${p => p.$active ? 'var(--primary)' : 'var(--text-muted)'};
  text-decoration: none;
  transition: all 0.2s;
  min-width: 60px;
  position: relative;
 
  &:active { transform: scale(0.9); }
 
  span {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
 
  ${p => p.$active && `
    background: var(--primary-light);
    svg { transform: translateY(-1px); }
  `}
`;
 
const CartNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  position: relative;
 
  &:active { transform: scale(0.9); }
 
  span {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2px;
  }
`;
 
const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 50%;
  transform: translateX(14px);
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  min-width: 16px;
  height: 16px;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  padding: 0 2px;
`;
 
export default function MobileNavBar() {
  const { isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
 
  const isActive = (path) => location.pathname === path;
 
  return (
    <>
      <Nav>
        <NavItem to="/" $active={isActive('/')}>
          <Home size={22} />
          <span>Início</span>
        </NavItem>
 
        <NavItem to="/search" $active={isActive('/search')}>
          <Search size={22} />
          <span>Buscar</span>
        </NavItem>
 
        <CartNavItem onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={22} />
          {cartCount > 0 && <Badge>{cartCount}</Badge>}
          <span>Pedidos</span>
        </CartNavItem>
 
        {isLoggedIn ? (
          <NavItem to="/profile" $active={isActive('/profile')}>
            <User size={22} />
            <span>Perfil</span>
          </NavItem>
        ) : (
          <NavItem to="/login" $active={isActive('/login')}>
            <LogIn size={22} />
            <span>Entrar</span>
          </NavItem>
        )}
      </Nav>
 
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}