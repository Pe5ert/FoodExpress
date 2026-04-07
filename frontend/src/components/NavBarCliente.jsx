import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSrc from '../imgs/Logo-site.png';

export default function NavBarCliente() {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const handleSair = () => sair();

  return (
    <nav className="bg-primary px-8 py-4 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] sticky top-0 z-[100]">
      <img src={logoSrc} alt="FoodExpress" className="h-10 w-auto" />

      <ul className="list-none flex gap-8 sm:gap-4 m-0 p-0">
        <li><Link to="/" className="text-white font-semibold text-sm hover:text-white/80 transition-colors">Início</Link></li>
        <li><Link to="/Restaurantes" className="text-white font-semibold text-sm hover:text-white/80 transition-colors">Restaurantes</Link></li>
        <li><Link to="/Mercados" className="text-white font-semibold text-sm hover:text-white/80 transition-colors">Mercados</Link></li>
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/perfil')}
          className="bg-secondary text-white border-none px-5 py-2 rounded-full cursor-pointer text-sm font-semibold hover:bg-accent transition-colors"
        >
          Meu Perfil
        </button>
        <button
          onClick={handleSair}
          className="bg-secondary text-white border-none px-5 py-2 rounded-full cursor-pointer text-sm font-semibold hover:bg-accent transition-colors"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
