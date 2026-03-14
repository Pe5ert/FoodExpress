import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Users, Settings, LogOut, User, Store } from 'lucide-react'

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

const StripLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .dot {
    width: 7px;
    height: 7px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulsar 2s infinite;
  }

  span {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.7);
    font-weight: 600;
  }

  @keyframes pulsar {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`

const StripRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  span {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.6);
    font-weight: 600;

    strong {
      color: rgba(255,255,255,0.9);
      font-weight: 700;
    }
  }
`

const Main = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0;
  height: 58px;

  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 1rem;
  }
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

const GerenteBadge = styled.div`
  background: rgba(46,41,78,0.08);
  color: var(--secondary);
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
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) { display: none; }
`

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${p => p.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  background: ${p => p.$active ? 'var(--primary-light)' : 'none'};
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: var(--primary);
    background: var(--primary-light);
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  flex-shrink: 0;
`

const StoreName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;

  svg { color: var(--accent); }

  @media (max-width: 900px) { display: none; }
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
    border-color: var(--primary);
    background: var(--primary-light);
  }

  .avatar {
    width: 28px;
    height: 28px;
    background: var(--secondary);
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
  { to: '/Pedidos', label: 'Pedidos', Icon: ShoppingBag },
  { to: '/Menu', label: 'Cardápio', Icon: UtensilsCrossed },
  { to: '/Relatorios', label: 'Relatórios', Icon: BarChart3 },
  { to: '/Funcionarios', label: 'Equipe', Icon: Users },
  { to: '/Configuracoes', label: 'Configurações', Icon: Settings },
]

export default function NavBarGerente() {
  const { usuario, sair, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const nomeLoja = usuario?.loja?.nome || 'Minha Loja'
  const nomeGerente = usuario?.nome || 'Gerente'

  const handleSair = () => {
    if (sair) sair()
    else if (logout) logout()
  }

  return (
    <Wrapper>
      <TopStrip>
        <StripLeft>
          <div className="dot" />
          <span>Painel do Gerente • <strong>{nomeLoja}</strong></span>
        </StripLeft>
        <StripRight>
          <span>Hoje: <strong>{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong></span>
          <span>Status: <strong style={{ color: 'var(--accent)' }}>Aberto</strong></span>
        </StripRight>
      </TopStrip>

      <Main>
        <Logo to="/">
          <LogoIcon>🍔</LogoIcon>
          <LogoText>Food<span>Express</span></LogoText>
        </Logo>
        <GerenteBadge>Gerente</GerenteBadge>

        <Nav>
          {links.map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} $active={location.pathname === to}>
              <Icon size={15} />
              {label}
            </NavItem>
          ))}
        </Nav>

        <Actions>
          <StoreName>
            <Store size={14} />
            {nomeLoja}
          </StoreName>

          <UserBtn onClick={() => navigate('/perfil')}>
            <div className="avatar">
              {nomeGerente.charAt(0).toUpperCase()}
            </div>
            <span className="nome">{nomeGerente.split(' ')[0]}</span>
          </UserBtn>

          <SairBtn onClick={handleSair} title="Sair">
            <LogOut size={15} />
          </SairBtn>
        </Actions>
      </Main>
    </Wrapper>
  )
}
