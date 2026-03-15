import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import logoSrc from '../imgs/Logo-site.png'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

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

  const inputClass = "w-full pl-10 pr-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"

  const campos = [
    { label: 'Nome completo', name: 'nome', type: 'text', placeholder: 'Seu nome completo', Icon: User },
    { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com', Icon: Mail },
    { label: 'Telefone / WhatsApp', name: 'telefone', type: 'tel', placeholder: '(11) 99999-9999', Icon: Phone },
  ]

  const beneficios = [
    'Peça em centenas de restaurantes',
    'Acompanhe seu pedido em tempo real',
    'Pagamento rápido e seguro',
    'Ofertas exclusivas para membros',
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Lado esquerdo — só desktop */}
      <div className="hidden lg:flex flex-col justify-center items-start p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FF6B35 0%,#e55a2b 50%,#2E294E 100%)' }}>
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

        <img src={logoSrc} alt="FoodExpress" className="h-12 w-auto mb-10 brightness-0 invert" />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Crie sua conta<br />e <span className="text-yellow-300">peça agora!</span>
          </h1>
          <p className="text-white/75 text-base font-medium leading-relaxed max-w-85 mb-10">
            Cadastre-se grátis e tenha acesso aos melhores restaurantes e mercados da sua região.
          </p>

          <div className="flex flex-col gap-3">
            {beneficios.map((b, i) => (
              <motion.div key={b}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
                className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-white/85 text-sm font-semibold">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2 min-h-screen lg:min-h-0">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-border p-7 sm:p-10 w-full max-w-105"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Topo mobile */}
          <div className="lg:hidden flex justify-center mb-7">
            <img src={logoSrc} alt="FoodExpress" className="h-11 w-auto" />
          </div>

          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer mb-6 hover:text-text-primary transition-colors">
            <ArrowLeft size={15} /> Voltar para login
          </button>

          <h2 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Criar conta grátis</h2>
          <p className="text-sm text-text-muted font-semibold mb-7">Rápido e fácil, leva menos de 1 minuto</p>

          <form onSubmit={handleEnviar} className="flex flex-col gap-4">
            {campos.map(({ label, name, type, placeholder, Icon }, i) => (
              <motion.div key={name} className="flex flex-col gap-1.5"
                variants={itemVariants} initial="hidden" animate="show"
                transition={{ delay: i * 0.08 }}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name={name} type={type} placeholder={placeholder}
                    value={dados[name]} onChange={handleChange} required className={inputClass} />
                </div>
              </motion.div>
            ))}

            <motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
              <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                  value={dados.senha} onChange={handleChange} required
                  className="w-full pl-10 pr-12 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal" />
                <button type="button" onClick={() => setMostrarSenha(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer" />
              <span className="text-xs text-text-secondary font-semibold leading-snug">
                Li e aceito os <a href="#" className="text-primary font-bold hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary font-bold hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <motion.button type="submit" disabled={carregando || !aceitouTermos}
              className="w-full py-4 bg-primary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(255,107,53,0.35)' }}
              whileTap={{ scale: 0.98 }}>
              {carregando ? 'Criando conta...' : 'Criar minha conta'}
            </motion.button>
          </form>

          <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
            <div className="flex-1 h-px bg-border" /> já tem conta? <div className="flex-1 h-px bg-border" />
          </div>

          <button onClick={() => navigate('/login')}
            className="w-full py-3 bg-transparent border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary-light">
            Entrar na minha conta
          </button>

          <button onClick={() => navigate('/register/store')}
            className="mt-2 w-full py-3 bg-transparent border border-border rounded-xl text-sm font-semibold text-text-secondary cursor-pointer transition-all hover:border-secondary hover:text-secondary hover:bg-secondary/5 flex items-center justify-center gap-2">
            🏪 Sou dono de restaurante ou mercado
          </button>
        </motion.div>
      </div>
    </div>
  )
}
