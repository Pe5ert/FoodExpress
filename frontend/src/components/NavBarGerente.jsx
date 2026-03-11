import { Link } from 'react-router-dom'
import styled from 'styled-components'

const NavBarContainer = styled.nav`
  background: #2E294E;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(31, 47, 61, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 3px solid #FF6B35;

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
    margin-left: 3rem;

    @media (max-width: 768px) {
      gap: 1rem;
      margin-left: 1rem;
    }
  }

  ul {
    list-style: none;
    display: flex;
    gap: 2rem;
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
    font-weight: 600;
    font-size: 0.95rem;
    position: relative;
    transition: color 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover {
      color: #FF6B35;
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 3px;
      bottom: -8px;
      left: 0;
      background-color: #FF6B35;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;

    .restaurant-name {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      color: #1B998B;
      font-size: 0.9rem;
    }

    .badge {
      background-color: #1B998B;
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
    }
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 1.5rem;

    button {
      background-color: #FF6B35;
      color: #fff;
      border: none;
      padding: 0.6rem 1.8rem;
      border-radius: 25px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      transition: background-color 0.3s ease, transform 0.2s ease;
      font-size: 0.9rem;

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

export default function NavBarGerente() {
  return (
    <NavBarContainer>
      <div className="logo">
        FoodExpress
      </div>
      <div className="nav-content">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/Pedidos">Pedidos</Link></li>
          <li><Link to="/Menu">Menu</Link></li>
          <li><Link to="/Relatorios">Relatórios</Link></li>
          <li><Link to="/Funcionarios">Funcionários</Link></li>
          <li><Link to="/Configuracoes">Configurações</Link></li>
        </ul>
      </div>
      <div className="status-info">
        <div className="restaurant-name">Seu Restaurante</div>
        <div className="badge"> Ativo</div>
      </div>
      <div className="user-menu">
        <button> Perfil</button>
        <button className="logout">Sair</button>
      </div>
    </NavBarContainer>
  )
}
