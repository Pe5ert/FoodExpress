import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Home, Search, ClipboardList, User } from 'lucide-react'

const NavContainer = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  z-index: 100;

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
  gap: 0.25rem;
  color: ${props => props.$active ? '#FF6B35' : '#666'};
  cursor: pointer;
  transition: color 0.3s ease;
  text-decoration: none;

  &:hover {
    color: #FF6B35;
  }

  span {
    font-size: 0.7rem;
    font-family: 'Inter', sans-serif;
  }
`;

export default function MobileNavBar() {
  return (
    <NavContainer>
      <NavItem to="/" $active>
        <Home size={24} />
        <span>Início</span>
      </NavItem>
      <NavItem to="/">
        <Search size={24} />
        <span>Buscar</span>
      </NavItem>
      <NavItem to="/Restaurantes">
        <ClipboardList size={24} />
        <span>Pedidos</span>
      </NavItem>
      <NavItem to="/login">
        <User size={24} />
        <span>Perfil</span>
      </NavItem>
    </NavContainer>
  )
}

