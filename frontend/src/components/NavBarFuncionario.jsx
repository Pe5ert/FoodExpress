import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, ShoppingBag, Clock, Headphones, LogOut } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

const links = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/Pedidos', label: 'Meus Pedidos', Icon: ShoppingBag },
  { to: '/Historico', label: 'Histórico', Icon: Clock },
  { to: '/Suporte', label: 'Suporte', Icon: Headphones },
]

export default function NavBarFuncionario() {
  const { usuario, sair, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const nomeFuncionario = usuario?.nome || 'Funcionário'
  const handleSair = () => { if (sair) sair(); else if (logout) logout() }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="hidden md:flex bg-secondary px-6 py-1.5 justify-between items-center">
        <span className="text-[0.78rem] text-white/70 font-semibold">Painel do Funcionário</span>
        <span className="text-[0.78rem] text-white/60 font-semibold">FoodExpress Delivery</span>
      </div>

      <div className="max-w-320 mx-auto px-6 h-14 flex items-center">
        <Link to="/" className="flex items-center gap-2 mr-6 flex-shrink-0">
          <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto" />
        </Link>

        <span className="hidden lg:block text-[0.72rem] font-extrabold text-accent bg-[rgba(27,153,139,0.1)] px-2.5 py-1 rounded-md uppercase tracking-wider mr-6 flex-shrink-0">Funcionário</span>

        <nav className="hidden md:flex items-center flex-1 gap-0">
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 h-14 text-[0.85rem] font-bold transition-all whitespace-nowrap border-b-2 ${
                location.pathname === to
                  ? 'text-accent border-accent bg-accent-light'
                  : 'text-text-secondary border-transparent hover:text-accent hover:border-accent'
              }`}
            >
              <Icon size={15} />{label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 border border-[rgba(27,153,139,0.2)] bg-[rgba(27,153,139,0.1)] text-accent px-3 py-1.5 rounded-full text-[0.78rem] font-extrabold cursor-pointer">
            <div className="w-2 h-2 bg-text-muted rounded-full" />Offline
          </div>

          <div onClick={() => navigate('/perfil')} className="flex items-center gap-2 bg-surface-2 border border-border px-3 pr-4 py-1.5 rounded-full cursor-pointer transition-all hover:border-accent hover:bg-accent-light">
            <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white text-[0.8rem] font-bold">{nomeFuncionario.charAt(0).toUpperCase()}</div>
            <span className="hidden sm:block text-[0.85rem] font-bold text-text-primary">{nomeFuncionario.split(' ')[0]}</span>
          </div>

          <button onClick={handleSair} className="w-9 h-9 bg-transparent border border-border rounded-full flex items-center justify-center text-text-secondary cursor-pointer transition-all hover:border-red-400 hover:text-red-500 hover:bg-red-50">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
