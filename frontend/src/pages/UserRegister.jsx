import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

export default function CadastroUsuario() {
  const [dados, setDados] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const { cadastrarCliente, signupCliente } = useAuth()
  const navigate = useNavigate()

  const handleEnviar = (e) => {
    e.preventDefault()
    if (!aceitouTermos) return
    setCarregando(true)
    const fn = cadastrarCliente || signupCliente
    fn({ name: dados.nome, email: dados.email, phone: dados.telefone, password: dados.senha })
  }

  const handleChange = (e) => setDados({ ...dados, [e.target.name]: e.target.value })

  const inputBase = "w-full pl-10 pr-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"

  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-border p-7 sm:p-10 w-full max-w-105">

        <button onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer mb-7 hover:text-text-primary transition-colors">
          <ArrowLeft size={15} /> Voltar para login
        </button>

        <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto mb-5" />

        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Criar conta</h1>
        <p className="text-sm text-text-muted font-semibold mb-7">Cadastre-se grátis e faça seu pedido agora</p>

        <form onSubmit={handleEnviar} className="flex flex-col gap-4">
          {[
            { label: 'Nome completo', name: 'nome', type: 'text', placeholder: 'Seu nome completo', Icon: User },
            { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com', Icon: Mail },
            { label: 'Telefone / WhatsApp', name: 'telefone', type: 'tel', placeholder: '(11) 99999-9999', Icon: Phone },
          ].map(({ label, name, type, placeholder, Icon }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input name={name} type={type} placeholder={placeholder} value={dados[name]} onChange={handleChange} required className={inputBase} />
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Senha</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                value={dados.senha} onChange={handleChange} required
                className="w-full pl-10 pr-12 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"
              />
              <button type="button" onClick={() => setMostrarSenha(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer mt-1">
            <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0 cursor-pointer" />
            <span className="text-xs text-text-secondary font-semibold leading-snug">
              Li e aceito os <a href="#" className="text-primary font-bold hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary font-bold hover:underline">Política de Privacidade</a>
            </span>
          </label>

          <button type="submit" disabled={carregando || !aceitouTermos}
            className="mt-1 w-full py-4 bg-primary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-px hover:shadow-lg disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:translate-y-0">
            {carregando ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
          <div className="flex-1 h-px bg-border" /> já tem conta? <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={() => navigate('/login')}
          className="w-full py-3 bg-transparent border-none text-accent font-extrabold text-sm cursor-pointer hover:underline">
          Entrar na minha conta
        </button>

        <button onClick={() => navigate('/register/store')}
          className="mt-2 w-full py-3.5 bg-transparent border border-border rounded-xl text-sm font-semibold text-text-secondary cursor-pointer transition-all hover:border-secondary hover:text-secondary hover:bg-secondary/5 flex items-center justify-center gap-2">
          🏪 Sou dono de restaurante ou mercado
        </button>
      </div>
    </div>
  )
}
