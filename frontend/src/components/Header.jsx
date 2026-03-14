import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import CartDrawer from './CartDrawer'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { Search, MapPin, ChevronDown, LogIn, ShoppingBag, User, LogOut } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

const Barra = styled.header`
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 200;
`

const Linha = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 0.75rem;
  }
`

const Logo = styled(Link)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

const LogoImg = styled.img`
  height: 52px;
  width: auto;
  object-fit: contain;
  display: block;

  @media (max-width: 480px) {
    height: 44px;
  }
`

const Nav = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 960px) { display: none; }
`

const NavLink = styled(Link)`
  padding: 0 0.9rem;
  height: 72px;
  display: flex;
  align-items: center;
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${p => p.$ativo ? 'var(--primary)' : 'var(--text-secondary)'};
  border-bottom: 2.5px solid ${p => p.$ativo ? 'var(--primary)' : 'transparent'};
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }
`

const Busca = styled.form`
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0 1rem;
  height: 42px;
  gap: 0.5rem;
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(255,107,53,0.08);
  }

  input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 0.9rem;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    color: var(--text-primary);
    &::placeholder { color: var(--text-muted); font-weight: 500; }
  }

  svg { color: var(--text-muted); flex-shrink: 0; }

  @media (max-width: 768px) { display: none; }
`

const Localizacao = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover { background: var(--primary-light); }

  .texto {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .rotulo {
      font-family: 'Nunito', sans-serif;
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 600;
      line-height: 1;
    }

    .local {
      font-family: 'Nunito', sans-serif;
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--text-primary);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }
  }

  @media (max-width: 600px) {
    .texto { display: none; }
  }
`

const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
  flex-shrink: 0;
`

const BotaoIcone = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background: var(--primary-light);
    color: var(--primary);
  }
`

const BotaoEntrar = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.5rem 1.1rem;
  font-family: 'Nunito', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
  }
`

const BotaoCarrinho = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.45rem 0.9rem 0.45rem 0.65rem;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    border-color: var(--primary);
    background: var(--primary-light);
  }

  .icone-wrap {
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--primary);
      color: white;
      border-radius: 99px;
      min-width: 14px;
      height: 14px;
      font-size: 0.58rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 2px;
      border: 1.5px solid white;
    }
  }
`

const InfoCarrinho = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .valor {
    font-family: 'Sora', sans-serif;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
  }

  .qtd {
    font-family: 'Nunito', sans-serif;
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 600;
    line-height: 1.3;
  }

  @media (max-width: 480px) { display: none; }
`

export default function Header() {
  const { estaLogado, isLoggedIn, usuario, sair, logout } = useAuth()
  const { cartCount, totalCarrinho, cartTotal } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [busca, setBusca] = useState('')
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  const logado = estaLogado || isLoggedIn
  const total = totalCarrinho || cartTotal || 0
  const qtd = cartCount || 0

  const handleBusca = (e) => {
    e.preventDefault()
    if (busca.trim()) navigate(`/search?q=${encodeURIComponent(busca)}`)
  }

  const handleSair = () => {
    if (sair) sair()
    else if (logout) logout()
  }

  const ativo = (path) => location.pathname === path

  return (
    <Barra>
      <Linha>
        <Logo to="/">
          <LogoImg src={logoSrc} alt="FoodExpress" />
        </Logo>

        <Nav>
          <NavLink to="/" $ativo={ativo('/')}>Início</NavLink>
          <NavLink to="/Restaurantes" $ativo={ativo('/Restaurantes')}>Restaurantes</NavLink>
          <NavLink to="/Mercados" $ativo={ativo('/Mercados')}>Mercados</NavLink>
          <NavLink to="/Restaurantes">Bebidas</NavLink>
          <NavLink to="/Mercados">Farmácias</NavLink>
        </Nav>

        <Busca onSubmit={handleBusca}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Busque por item ou loja"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </Busca>

        <Localizacao>
          <MapPin size={18} color="var(--primary)" />
          <div className="texto">
            <span className="rotulo">Próximo de</span>
            <span className="local">Tauape</span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </Localizacao>

        <Acoes>
          {logado ? (
            <>
              <BotaoIcone onClick={() => navigate('/perfil')} title="Meu perfil">
                <User size={20} />
              </BotaoIcone>

              <BotaoCarrinho onClick={() => setCarrinhoAberto(true)}>
                <div className="icone-wrap">
                  <ShoppingBag size={20} />
                  {qtd > 0 && <span className="badge">{qtd}</span>}
                </div>
                <InfoCarrinho>
                  <span className="valor">R$ {total.toFixed(2)}</span>
                  <span className="qtd">{qtd} {qtd === 1 ? 'item' : 'itens'}</span>
                </InfoCarrinho>
              </BotaoCarrinho>

              <BotaoIcone onClick={handleSair} title="Sair">
                <LogOut size={18} />
              </BotaoIcone>
            </>
          ) : (
            <>
              <BotaoCarrinho onClick={() => setCarrinhoAberto(true)}>
                <div className="icone-wrap">
                  <ShoppingBag size={20} />
                  {qtd > 0 && <span className="badge">{qtd}</span>}
                </div>
                <InfoCarrinho>
                  <span className="valor">R$ {total.toFixed(2)}</span>
                  <span className="qtd">{qtd} {qtd === 1 ? 'item' : 'itens'}</span>
                </InfoCarrinho>
              </BotaoCarrinho>

              <BotaoEntrar onClick={() => navigate('/login')}>
                <LogIn size={16} />
                Entrar
              </BotaoEntrar>
            </>
          )}
        </Acoes>
      </Linha>

      <CartDrawer isOpen={carrinhoAberto} onClose={() => setCarrinhoAberto(false)} />
    </Barra>
  )
}
