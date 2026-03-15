import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  Search,
  MapPin,
  ChevronDown,
  LogIn,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import logoSrc from '../imgs/Logo-site.png';

export default function Header() {
  const { estaLogado, isLoggedIn, usuario, sair, logout } = useAuth();
  const { cartCount, totalCarrinho, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState('');
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [menuMobile, setMenuMobile] = useState(false);

  const logado = estaLogado || isLoggedIn;
  const total = totalCarrinho || cartTotal || 0;
  const qtd = cartCount || 0;
  const ativo = (path) => location.pathname === path;

  const handleBusca = (e) => {
    e.preventDefault();
    if (busca.trim()) navigate(`/search?q=${encodeURIComponent(busca)}`);
  };

  const handleSair = () => {
    if (sair) sair();
    else if (logout) logout();
    setMenuMobile(false);
  };

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/Restaurantes', label: 'Restaurantes' },
    { to: '/Mercados', label: 'Mercados' },
    { to: '/Restaurantes', label: 'Bebidas' },
    { to: '/Mercados', label: 'Farmácias' },
  ];

  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center gap-3 sm:gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logoSrc} alt="FoodExpress" className="h-12 sm:h-13 w-auto object-contain" />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map(({ to, label }) => {
              const eAtivo = ativo(to) && label !== 'Bebidas' && label !== 'Farmácias';
              return (
                <Link
                  key={label}
                  to={to}
                  className={`px-3 h-18 flex items-center text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                    eAtivo
                      ? 'text-primary border-primary'
                      : 'text-text-secondary border-transparent hover:text-primary hover:border-primary'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Busca */}
          <form
            onSubmit={handleBusca}
            className="flex-1 hidden md:flex items-center bg-surface-2 border border-border rounded-full px-4 h-11 gap-2 transition-all focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.08)]"
          >
            <Search size={16} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Busque por item ou loja"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
            />
          </form>

          {/* Localização — só desktop grande */}
          <button className="hidden xl:flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all hover:bg-primary-light shrink-0 cursor-pointer border-none bg-transparent">
            <MapPin size={18} className="text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-[0.68rem] text-text-muted font-semibold leading-none">
                Próximo de
              </span>
              <span className="text-sm font-extrabold text-text-primary leading-tight">Tauape</span>
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {/* Ações */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {/* Botão hamburguer mobile */}
            <button
              onClick={() => setMenuMobile((m) => !m)}
              className="lg:hidden w-10 h-10 rounded-full border-none bg-transparent flex items-center justify-center text-text-secondary cursor-pointer hover:bg-primary-light hover:text-primary transition-all"
            >
              {menuMobile ? <X size={20} /> : <Menu size={20} />}
            </button>

            {logado ? (
              <>
                <button
                  onClick={() => navigate('/perfil')}
                  className="hidden sm:flex w-10 h-10 rounded-full border-none bg-transparent items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-primary-light hover:text-primary"
                >
                  <User size={20} />
                </button>

                <button
                  onClick={() => setCarrinhoAberto(true)}
                  className="flex items-center gap-2 bg-transparent border border-border rounded-full py-2 pr-3 pl-2.5 cursor-pointer transition-all hover:border-primary hover:bg-primary-light"
                >
                  <div className="relative w-5 h-5 flex items-center justify-center text-text-primary">
                    <ShoppingBag size={18} />
                    {qtd > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-3.5 h-3.5 text-[0.55rem] font-extrabold flex items-center justify-center px-px border border-white">
                        {qtd}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="font-display text-xs font-extrabold text-text-primary leading-none">
                      R$ {total.toFixed(2)}
                    </span>
                    <span className="text-[0.65rem] text-text-muted font-semibold leading-snug">
                      {qtd} {qtd === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleSair}
                  className="hidden sm:flex w-10 h-10 rounded-full border-none bg-transparent items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCarrinhoAberto(true)}
                  className="flex items-center gap-2 bg-transparent border border-border rounded-full py-2 pr-3 pl-2.5 cursor-pointer transition-all hover:border-primary hover:bg-primary-light"
                >
                  <div className="relative w-5 h-5 flex items-center justify-center text-text-primary">
                    <ShoppingBag size={18} />
                    {qtd > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-3.5 h-3.5 text-[0.55rem] font-extrabold flex items-center justify-center px-px border border-white">
                        {qtd}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-1.5 bg-transparent border border-border rounded-full px-4 py-2 text-sm font-bold text-text-primary cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary-light whitespace-nowrap"
                >
                  <LogIn size={15} /> Entrar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {menuMobile && (
          <div className="lg:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
            {/* Busca mobile */}
            <form
              onSubmit={handleBusca}
              className="flex items-center bg-surface-2 border border-border rounded-full px-4 h-10 gap-2 mb-2 focus-within:border-primary"
            >
              <Search size={15} className="text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Busque por item ou loja"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
              />
            </form>

            {navLinks.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMenuMobile(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${ativo(to) ? 'text-primary bg-primary-light' : 'text-text-secondary hover:text-primary hover:bg-primary-light'}`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-border mt-1 pt-2 flex gap-2">
              {logado ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/perfil');
                      setMenuMobile(false);
                    }}
                    className="flex-1 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-bold text-text-primary cursor-pointer hover:bg-primary-light hover:border-primary transition-all flex items-center justify-center gap-1.5"
                  >
                    <User size={16} /> Perfil
                  </button>
                  <button
                    onClick={handleSair}
                    className="flex-1 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-500 cursor-pointer hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMenuMobile(false);
                  }}
                  className="flex-1 py-2.5 bg-primary text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn size={16} /> Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={carrinhoAberto} onClose={() => setCarrinhoAberto(false)} />
    </>
  );
}
