import { Link } from 'react-router-dom'
import styled from 'styled-components'

const NavBarContainer = styled.nav`
  background-color: #2E294E;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;

  .logo {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: #FF6B35;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-content {
    display: flex;
    align-items: center;
    gap: 3rem;
    flex: 1;
    margin-left: 2rem;

    @media (max-width: 768px) {
      gap: 1rem;
      margin-left: 1rem;
    }
  }

  ul {
    list-style: none;
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;

    @media (max-width: 768px) {
      gap: 1rem;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.95rem;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: #FF6B35;
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 0;
      background-color: #1B998B;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }

  .status-badge {
    background-color: #1B998B;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;

    button {
      background-color: #FF6B35;
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      transition: background-color 0.3s ease, transform 0.2s ease;

      &:hover {
        background-color: #1B998B;
        transform: translateY(-2px);
      }

      &.logout {
        background-color: transparent;
        border: 2px solid #FF6B35;
        color: #FF6B35;

        &:hover {
          background-color: #FF6B35;
          color: #fff;
        }
      }
    }
  }
`;

export default function NavBarFuncionario() {
  return (
    <NavBarContainer>
      <div className="logo">
        FoodExpress
      </div>
      <div className="nav-content">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/Pedidos">Meus Pedidos</Link></li>
          <li><Link to="/Historico">Histórico</Link></li>
          <li><Link to="/Suporte">Suporte</Link></li>
        </ul>
        <div className="status-badge">
           Offline
        </div>
      </div>
      <div className="user-menu">
        <button> Perfil</button>
        <button className="logout">Sair</button>
      </div>
    </NavBarContainer>
  )
}
