import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  BarChart3, Users, Settings, LogOut, Store,
} from 'lucide-react';
import logoSrc from '../imgs/Logo-site.png';

const links = [
  { to: '/gerente', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/gerente/pedidos', label: 'Pedidos', Icon: ShoppingBag },
  { to: '/gerente/cardapio', label: 'Cardápio', Icon: UtensilsCrossed },
  { to: '/gerente/relatorios', label: 'Relatórios', Icon: BarChart3 },
  { to: '/gerente/equipe', label: 'Equipe', Icon: Users },
  { to: '/gerente/configuracoes', label: 'Configurações', Icon: Settings },
];

export default function NavBarGerente() {
  const { usuario, sair } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nomeLoja = usuario?.loja?.nome || 'Minha Loja';
  const nomeGerente = usuario?.nome || 'Gerente';
  const handleSair = () => { sair(); };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="hidden md:flex bg-secondary px-6 py-1.5 justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-[0.78rem] text-white/70 font-semibold">
            Painel do Gerente · <strong className="text-white/90">{nomeLoja}</strong>
          </span>
        </div>
        <span className="text-[0.78rem] text-white/60 font-semibold">
          Hoje: <strong className="text-white/90">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong>
          &nbsp;· Status: <strong className="text-accent">Aberto</strong>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-0">
        <Link to="/gerente" className="flex items-center gap-2 mr-6 shrink-0">
          <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto" />
        </Link>

        <span className="hidden lg:block text-[0.72rem] font-extrabold text-secondary bg-secondary/8 px-2.5 py-1 rounded-md uppercase tracking-wider mr-6 shrink-0">
          Gerente
        </span>

        <nav className="hidden md:flex items-center flex-1 gap-0 overflow-x-auto scrollbar-none">
          {links.map(({ to, label, Icon }) => {
            const IconComponent = Icon
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 h-14 text-[0.85rem] font-bold transition-all whitespace-nowrap border-b-2 ${
                location.pathname === to
                  ? 'text-primary border-primary bg-primary-light'
                  : 'text-text-secondary border-transparent hover:text-primary hover:border-primary'
              }`}
            >
              <IconComponent size={15} />{label}
            </Link>
          )
        })}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 bg-surface-2 border border-border px-3 py-1.5 rounded-full text-[0.85rem] font-bold text-text-primary">
            <Store size={14} className="text-accent" />{nomeLoja}
          </div>

          <div onClick={() => navigate('/gerente')}
            className="flex items-center gap-2 bg-surface-2 border border-border px-3 pr-4 py-1.5 rounded-full cursor-pointer hover:border-primary hover:bg-primary-light transition-all"
          >
            <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-white text-[0.8rem] font-bold">
              {nomeGerente.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-[0.85rem] font-bold text-text-primary">
              {nomeGerente.split(' ')[0]}
            </span>
          </div>

          <button onClick={handleSair}
            className="w-9 h-9 bg-transparent border border-border rounded-full flex items-center justify-center text-text-secondary cursor-pointer hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
