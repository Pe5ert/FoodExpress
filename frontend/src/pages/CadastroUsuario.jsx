import { useState } from 'react'
import { mascaraTelefone } from '../utils/mascaras'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Phone, ArrowLeft, Check, Send, User } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import logoSrc from '../imgs/Logo-site.png'

const beneficiosCadastroUsuario = [
  'Peça em centenas de restaurantes',
  'Acompanhe seu pedido em tempo real',
  'Pagamento rápido e seguro',
  'Ofertas exclusivas para membros',
]

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function CadastroUsuario() {
  const [modo, setModo] = useState('email') // 'email' | 'telefone'
  const [dados, setDados] = useState({ nome: '', email: '', telefone: '' })
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const { cadastrarCliente } = useAuth()
  const navigate = useNavigate()

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!aceitouTermos) return
    if (!dados.nome.trim()) return
    if (modo === 'email' && !dados.email.trim()) return
    if (modo === 'telefone' && !dados.telefone.trim()) return

    setCarregando(true)
    try {
      if (modo === 'email') {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/registrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: dados.nome, email: dados.email, telefone: dados.telefone }),
        })
        setEnviado(true)
      } else {
        // Cadastro por nome + telefone — entra direto
        await cadastrarCliente({ nome: dados.nome, telefone: dados.telefone, email: `${dados.telefone.replace(/\D/g, '')}@telefone.local` })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let valor = value
    if (name === 'telefone') valor = mascaraTelefone(value)
    setDados({ ...dados, [name]: valor })
  }

  const inputClass = "w-full pl-10 pr-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Lado esquerdo — só desktop */}
      <div className="hidden lg:flex flex-col justify-center items-start p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FF6B35 0%,#e55a2b 50%,#2E294E 100%)' }}>
        <div className="absolute top-[80px] right-[80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[60px] left-[60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

        <button onClick={() => navigate('/')} className="absolute top-6 left-11 text-white/80 hover:text-white transition-colors flex items-center gap-1">
          <img src={logoSrc} alt="FoodExpress" className="h-16 w-auto mb-12" />
        </button>

        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Crie sua conta<br />e <span className="text-yellow-300">peça agora!</span>
          </h1>
          <p className="text-white/75 text-base font-medium leading-relaxed max-w-85 mb-10">
            Cadastre-se grátis e tenha acesso aos melhores restaurantes e mercados da sua região.
          </p>

          <div className="flex flex-col gap-3">
            {beneficiosCadastroUsuario.map((b, i) => (
              <Motion.div key={b}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
                className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-white/85 text-sm font-semibold">{b}</span>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2 min-h-screen lg:min-h-0">
        <Motion.div
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
          <p className="text-sm text-text-muted font-semibold mb-5">Rápido e fácil, leva menos de 1 minuto</p>

          {/* Seletor de modo */}
          <div className="flex gap-2 p-1 bg-surface-2 rounded-xl mb-6 border border-border">
            <button
              onClick={() => setModo('email')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none ${modo === 'email' ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-text-muted hover:text-text-primary'}`}
            >
              📧 Por e-mail
            </button>
            <button
              onClick={() => setModo('telefone')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none ${modo === 'telefone' ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-text-muted hover:text-text-primary'}`}
            >
              📱 Por telefone
            </button>
          </div>

          {enviado ? (
            <Motion.div
              className="flex flex-col items-center text-center py-6 gap-4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Send size={28} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-text-primary mb-1">Verifique seu e-mail!</h3>
                <p className="text-sm text-text-muted font-semibold leading-relaxed">
                  Enviamos um link de acesso para<br />
                  <strong className="text-text-primary">{dados.email}</strong>
                </p>
              </div>
              <p className="text-xs text-text-muted">Não recebeu? Verifique o spam ou <button onClick={() => setEnviado(false)} className="text-primary font-bold bg-transparent border-none cursor-pointer hover:underline">tente novamente</button></p>
            </Motion.div>
          ) : (
            <form onSubmit={handleEnviar} className="flex flex-col gap-4">
              {/* Nome */}
              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show">
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Seu nome *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="nome" type="text" placeholder="Como podemos te chamar?"
                    value={dados.nome} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>

              {modo === 'email' ? (
                <>
                  <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
                    <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">E-mail *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input name="email" type="email" placeholder="seu@email.com"
                        value={dados.email} onChange={handleChange} required className={inputClass} />
                    </div>
                  </Motion.div>
                  <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
                    <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Telefone (opcional)</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input name="telefone" type="tel" placeholder="(11) 99999-9999"
                        value={dados.telefone} onChange={handleChange} className={inputClass} />
                    </div>
                  </Motion.div>
                </>
              ) : (
                <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
                  <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">WhatsApp / Telefone *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input name="telefone" type="tel" placeholder="(11) 99999-9999"
                      value={dados.telefone} onChange={handleChange} required className={inputClass} />
                  </div>
                  <p className="text-xs text-text-muted font-medium mt-0.5">Seu número será seu identificador de acesso</p>
                </Motion.div>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer" />
                <span className="text-xs text-text-secondary font-semibold leading-snug">
                  Li e aceito os <Link to="/termos-uso" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">Termos de Uso</Link> e a <Link to="/politica-privacidade" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              <Motion.button type="submit" disabled={carregando || !aceitouTermos}
                className="w-full py-4 bg-primary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(255,107,53,0.35)' }}
                whileTap={{ scale: 0.98 }}>
                {carregando
                  ? (modo === 'email' ? 'Enviando link...' : 'Criando conta...')
                  : (modo === 'email' ? 'Criar conta — receber link por e-mail' : 'Criar conta com telefone')}
              </Motion.button>
            </form>
          )}

          <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
            <div className="flex-1 h-px bg-border" /> já tem conta? <div className="flex-1 h-px bg-border" />
          </div>

          <button type="button" onClick={() => navigate('/login')}
            className="w-full py-3 bg-transparent border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary-light">
            Entrar na minha conta
          </button>

          <button type="button" onClick={() => navigate('/register/store')}
            className="mt-2 w-full py-3 bg-transparent border border-border rounded-xl text-sm font-semibold text-text-secondary cursor-pointer transition-all hover:border-secondary hover:text-secondary hover:bg-secondary/5 flex items-center justify-center gap-2">
            🏪 Sou dono de restaurante ou mercado
          </button>
        </Motion.div>
      </div>
    </div>
  )
}
