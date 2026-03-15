import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavBarContainer = styled.nav`
  background-color: #ff6b35;
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
    font-weight: 500;
    font-size: 1rem;
    position: relative;
    transition: color 0.3s ease;

    &:hover {
      color: #fff8f5;
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 0;
      background-color: #1b998b;
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
      background-color: #2e294e;
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #1b998b;
      }
    }
  }
`;

export default function NavBarCliente() {
  return (
    <NavBarContainer>
      <div>
        <img src="../imgs/logo-FoodExpress.png" alt="Logo" />
      </div>
      <ul>
        <li>
          <Link to="/">Início</Link>
        </li>
        <li>
          <Link to="/Restaurantes">Restaurantes</Link>
        </li>
        <li>
          <Link to="/Mercados">Mercados</Link>
        </li>
      </ul>
      <div className="user-menu">
        <button>Meu Perfil</button>
        <button>Sair</button>
      </div>
    </NavBarContainer>
  );
}
