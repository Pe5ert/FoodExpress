import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, ShoppingBag, Clock, HeadphonesIcon, LogOut, User } from 'lucide-react'

const Wrapper = styled.header`
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: var(--shadow-sm);
`

const TopStrip = styled.div`
  background: var(--secondary);
  padding: 0.35rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) { display: none; }
`

const StripText = styled.span`
  font-size: 0.78rem;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
`

const Main = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0;
  height: 58px;

  @media (max-width: 768px) { padding: 0 1rem; }
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-right: 2rem;
`

const LogoIcon = styled.div`
  width: 34px;
  height: 34px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`

const LogoText = styled.span`
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--secondary);
  letter-spacing: -0.5px;
  span { color: var(--primary); }

  @media (max-width: 900px) { display: none; }
`

const FuncionarioBadge = styled.div`
  background: rgba(27,153,139,0.1);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-xs);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-left: -1rem;
  margin-right: 2rem;

  @media (max-width: 900px) { display: none; }
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0.1rem;

  @media (max-width: 768px) { display: none; }
`

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${p => p.$active ? 'var(--accent)' : 'var(--text-secondary)'};
  background: ${p => p.$active ? 'var(--accent-light)' : 'none'};
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: var(--accent);
    background: var(--accent-light);
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
`

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${p => p.$online ? 'rgba(27,153,139,0.1)' : 'rgba(160,160,160,0.1)'};
  border: 1.5px solid ${p => p.$online ? 'rgba(27,153,139,0.2)' : 'var(--border)'};
  color: ${p => p.$online ? 'var(--accent)' : 'var(--text-muted)'};
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${p => p.$online ? 'var(--accent)' : 'var(--text-muted)'};
  }

  &:hover { opacity: 0.8; }

  @media (max-width: 600px) { display: none; }
`

const UserBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  padding: 0.4rem 0.9rem 0.4rem 0.5rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-light);
  }

  .avatar {
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .nome {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary);

    @media (max-width: 480px) { display: none; }
  }
`

const SairBtn = styled.button`
  width: 36px;
  height: 36px;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: #FF4444;
    color: #FF4444;
    background: #fff5f5;
  }
`

const links = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/Pedidos', label: 'Meus Pedidos', Icon: ShoppingBag },
  { to: '/Historico', label: 'Histórico', Icon: Clock },
  { to: '/Suporte', label: 'Suporte', Icon: HeadphonesIcon },
]

export default function NavBarFuncionario() {
  const { usuario, sair, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const nomeFuncionario = usuario?.nome || 'Funcionário'

  const handleSair = () => {
    if (sair) sair()
    else if (logout) logout()
  }

  return (
    <Wrapper>
      <TopStrip>
        <StripText>Painel do Funcionário</StripText>
        <StripText>FoodExpress Delivery</StripText>
      </TopStrip>

      <Main>
        <Logo to="/">
          <LogoIcon>🍔</LogoIcon>
          <LogoText>Food<span>Express</span></LogoText>
        </Logo>
        <FuncionarioBadge>Funcionário</FuncionarioBadge>

        <Nav>
          {links.map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} $active={location.pathname === to}>
              <Icon size={15} />
              {label}
            </NavItem>
          ))}
        </Nav>

        <Actions>
          <StatusBadge $online={false}>
            <div className="dot" />
            Offline
          </StatusBadge>

          <UserBtn onClick={() => navigate('/perfil')}>
            <div className="avatar">
              {nomeFuncionario.charAt(0).toUpperCase()}
            </div>
            <span className="nome">{nomeFuncionario.split(' ')[0]}</span>
          </UserBtn>

          <SairBtn onClick={handleSair} title="Sair">
            <LogOut size={15} />
          </SairBtn>
        </Actions>
      </Main>
    </Wrapper>
  )
}
