import { Link } from 'react-router-dom'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  background-color: #FF6B35;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  .logo {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: #fff;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin: 0;
    padding: 0;

    @media (max-width: 768px) {
      display: none;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: #FFF8F5;
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

  .user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;

    button {
      background-color: #2E294E;
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #1B998B;
      }
    }
  }
`;

export default function Header() {
  return (
    <HeaderContainer>
      <div className="logo">
        FoodExpress
      </div>
      <nav>
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/Restaurantes">Restaurantes</Link></li>
          <li><Link to="/Mercados">Mercados</Link></li>
        </ul>
      </nav>
      <div className="user-menu">
        <button>Meu Perfil</button>
        <button>Sair</button>
      </div>
    </HeaderContainer>
  )
}

