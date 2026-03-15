import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import logoSrc from '../imgs/Logo-site.png'
import Footer from '../components/footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { entrar, login } = useAuth();
  const navigate = useNavigate();

  const handleEnviar = (e) => {
    e.preventDefault();
    setCarregando(true);
    const fn = entrar || login;
    fn(email, 'cliente');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado esquerdo — só desktop */}
      <div
        className="hidden lg:flex flex-col justify-center items-start p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#2E294E 0%,#1a1640 60%,#1B998B 100%)' }}
      >
        <div
          className="absolute bottom-25 right-25 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)',
          }}
        />

        <img src={logoSrc} alt="FoodExpress" className="h-12 w-auto mb-12" />

        <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
          Comida boa,
          <br />
          entregue <span className="text-primary">rápido</span>
        </h1>
        <p className="text-white/60 text-base font-medium leading-relaxed max-w-85 mb-12">
          Acesse sua conta e descubra centenas de restaurantes e mercados prontos para entregar até
          você.
        </p>

        <div className="flex flex-col gap-4">
          {[
            { icon: '🚀', text: 'Entrega em até 30 minutos' },
            { icon: '🔒', text: 'Pagamento 100% seguro' },
            { icon: '⭐', text: 'Avalie e acompanhe seus pedidos' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/80 text-sm font-semibold">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-lg shrink-0">
                {icon}
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2">
        <div className="bg-white rounded-3xl shadow-2xl border border-border p-8 sm:p-10 w-full max-w-100">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoSrc} alt="FoodExpress" className="h-12 w-auto" />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">
            Bem-vindo de volta!
          </h2>
          <p className="text-sm text-text-muted font-semibold mb-8">
            Entre na sua conta para continuar
          </p>

          <form onSubmit={handleEnviar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">
                E-mail ou Telefone
              </label>
              <input
                type="text"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <a href="#" className="text-xs text-primary font-bold self-end hover:underline">
              Esqueceu a senha?
            </a>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 bg-primary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-px hover:shadow-lg disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:translate-y-0 mt-1"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
            <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-text-secondary font-semibold">
            Não tem uma conta?{' '}
            <button
              onClick={() => navigate('/register/user')}
              className="text-accent font-extrabold bg-transparent border-none cursor-pointer hover:underline"
            >
              Cadastre-se grátis
            </button>
          </p>

          <button
            onClick={() => navigate('/register/store')}
            className="mt-3 w-full py-3.5 bg-transparent border border-border rounded-xl font-semibold text-sm text-text-secondary cursor-pointer transition-all hover:border-secondary hover:text-secondary hover:bg-secondary/5 flex items-center justify-center gap-2"
          >
            🏪 Cadastre seu restaurante ou mercado
          </button>
        </div>
      </div>
    </div>
  );
}
