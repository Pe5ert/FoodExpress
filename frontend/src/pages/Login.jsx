import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Store, User, Bike, ArrowRight } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'
import { motion as Motion, AnimatePresence } from 'framer-motion'

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(phrases, { typingSpeed = 60, deletingSpeed = 35, pauseMs = 2200 } = {}) {
  const [displayed, setDisplayed] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phase, setPhase] = useState('typing')
  const timeout = useRef(null)

  useEffect(() => {
    const current = phrases[phraseIndex]
    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeout.current = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          typingSpeed
        )
      } else {
        timeout.current = setTimeout(() => setPhase('deleting'), pauseMs)
      }
    } else {
      if (displayed.length > 0) {
        timeout.current = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deletingSpeed
        )
      } else {
        timeout.current = setTimeout(() => {
          setPhraseIndex(i => (i + 1) % phrases.length)
          setPhase('typing')
        }, deletingSpeed)
      }
    }
    return () => clearTimeout(timeout.current)
  }, [displayed, phase, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs])

  return displayed
}

function TypewriterLine({ phrases, accentColor = '#FF6B35' }) {
  const displayed = useTypewriter(phrases)
  return (
    <p className="text-white/75 text-lg font-semibold leading-relaxed min-h-[1.75rem]">
      {displayed}
      <Motion.span
        className="font-bold"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        style={{ color: accentColor }}
      >|</Motion.span>
    </p>
  )
}

// ─── Variantes ────────────────────────────────────────────────────────────────
const leftVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
}
const leftItem = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.42, ease: 'easeOut' } },
}
const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}
const fieldVariant = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } },
}

// ─── Config por perfil ────────────────────────────────────────────────────────
function getConfig(eParceiro, eEntregador) {
  if (eEntregador) return {
    tipo: 'entregador',
    titulo: 'Faça suas entregas,',
    destaque: 'no seu ritmo.',
    frases: [
      'Pronto para a próxima entrega? 🛵',
      'Seus ganhos de hoje te aguardam. 💰',
      'Cada quilômetro rende mais aqui. ⭐',
      'Flexibilidade pra viver melhor. 🌟',
    ],
    itens: [
      { icone: '🛵', texto: 'Aceite entregas quando quiser' },
      { icone: '💰', texto: 'Acompanhe seus ganhos em tempo real' },
      { icone: '⭐', texto: 'Histórico completo de rotas e avaliações' },
    ],
    gradiente: 'linear-gradient(155deg,#0c3d30 0%,#0a2d24 55%,#1B998B 100%)',
    accentColor: '#1B998B',
    corDestaque: 'text-emerald-400',
    badgeIcone: <Bike size={13} className="text-emerald-400" />,
    badgeTexto: 'Painel do Entregador',
    badgeCor: 'border-emerald-400/30 bg-emerald-400/10',
    badgeTextoCor: 'text-emerald-400',
    subtitulo: 'Acesse o painel de entregas',
    ctaTexto: 'Entrar como entregador',
    ctaCls: 'bg-emerald-600 hover:bg-emerald-700',
    mostrarCadastro: false,
    mostrarAlternativas: false,
    voltarLabel: '← Entrar como cliente',
  }

  if (eParceiro) return {
    tipo: 'gerente',
    titulo: 'Gerencie seu negócio,',
    destaque: 'com facilidade.',
    frases: [
      'Novos pedidos chegando agora... 📊',
      'Seu cardápio, do seu jeito. 🍽️',
      'Faturamento em tempo real. 💰',
      'Seus clientes te esperam online. 🚀',
    ],
    itens: [
      { icone: '📊', texto: 'Painel completo de pedidos ao vivo' },
      { icone: '🍽️', texto: 'Gestão de cardápio rápida e simples' },
      { icone: '💰', texto: 'Relatórios de faturamento detalhados' },
    ],
    gradiente: 'linear-gradient(155deg,#1e1a40 0%,#16133a 55%,#3730a3 100%)',
    accentColor: '#FF6B35',
    corDestaque: 'text-primary',
    badgeIcone: <Store size={13} className="text-primary" />,
    badgeTexto: 'Painel do Gerente',
    badgeCor: 'border-primary/30 bg-primary/10',
    badgeTextoCor: 'text-primary',
    subtitulo: 'Acesse o painel do seu estabelecimento',
    ctaTexto: 'Entrar como gerente',
    ctaCls: 'bg-primary hover:bg-primary-dark',
    mostrarCadastro: false,
    mostrarAlternativas: false,
    voltarLabel: '← Entrar como cliente',
  }

  return {
    tipo: 'cliente',
    titulo: 'Comida boa,',
    destaque: 'entregue rápido.',
    frases: [
      'Seu pedido favorito te espera... 🍕',
      'Entrega em até 30 minutos. 🚀',
      '+500 restaurantes disponíveis. 🍔',
      'Pagamento rápido e seguro. 🔒',
    ],
    itens: [
      { icone: '🚀', texto: 'Entrega em até 30 minutos' },
      { icone: '🔒', texto: 'Pagamento 100% seguro' },
      { icone: '⭐', texto: 'Avalie e acompanhe seus pedidos' },
    ],
    gradiente: 'linear-gradient(155deg,#2E294E 0%,#1a1640 55%,#1B998B 100%)',
    accentColor: '#FF6B35',
    corDestaque: 'text-primary',
    badgeIcone: <User size={13} className="text-primary" />,
    badgeTexto: 'Acesso para clientes',
    badgeCor: 'border-primary/30 bg-primary/10',
    badgeTextoCor: 'text-primary',
    subtitulo: 'Entre na sua conta para continuar',
    ctaTexto: 'Entrar na minha conta',
    ctaCls: 'bg-primary hover:bg-primary-dark',
    mostrarCadastro: true,
    mostrarAlternativas: true,
    voltarLabel: null,
  }
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Login() {
  const [params] = useSearchParams()
  const eParceiro   = params.get('parceiro')   === 'true'
  const eEntregador = params.get('entregador') === 'true'

  const [email, setEmail]               = useState('')
  const [senha, setSenha]               = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando]     = useState(false)
  const { entrar, entrarComGoogle }  = useAuth()
  const navigate    = useNavigate()
  const config      = getConfig(eParceiro, eEntregador)
  const perfilLogin = eEntregador ? 'entregador' : eParceiro ? 'gerente' : 'cliente'

  const handleEnviar = async (e) => {
    e.preventDefault()
    setCarregando(true)
    try {
      await entrar(email, perfilLogin)
    } catch (error) {
      alert(error?.message || 'Não foi possível fazer login.')
    } finally {
      setCarregando(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await entrarComGoogle()
    } catch (error) {
      alert(error?.message || 'Não foi possível iniciar o login com Google.')
    }
  }

  const inputCls = 'w-full px-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal'

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Lado esquerdo ── */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={config.tipo + '-left'}
          className="hidden lg:flex flex-col justify-center items-start p-12 xl:p-16 relative overflow-hidden"
          style={{ background: config.gradiente }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Blobs decorativos */}
          <div className="absolute bottom-20 right-12 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${config.accentColor}28 0%, transparent 70%)` }} />
          <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

          {/* Logo */}
          <Motion.button onClick={() => navigate('/')}
            className="absolute top-8 left-10 bg-transparent border-none cursor-pointer"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <img src={logoSrc} alt="FoodExpress" className="h-14 w-auto" />
          </Motion.button>

          <Motion.div
            className="relative z-10 mt-10"
            variants={leftVariants} initial="hidden" animate="show"
          >
            {/* Badge */}
            <Motion.div variants={leftItem}
              className={`flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border w-fit backdrop-blur-sm ${config.badgeCor}`}>
              {config.badgeIcone}
              <span className={`text-xs font-bold ${config.badgeTextoCor}`}>{config.badgeTexto}</span>
            </Motion.div>

            {/* Título */}
            <Motion.h1 variants={leftItem}
              className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
              {config.titulo}<br />
              <span className={config.corDestaque}>{config.destaque}</span>
            </Motion.h1>

            {/* Typewriter */}
            <Motion.div variants={leftItem} className="mb-8">
              <TypewriterLine phrases={config.frases} accentColor={config.accentColor} />
            </Motion.div>

            {/* Divisor */}
            <Motion.div variants={leftItem} className="w-10 h-0.5 bg-white/20 mb-7 rounded-full" />

            {/* Feature list */}
            <Motion.div variants={leftItem} className="flex flex-col gap-4">
              {config.itens.map(({ icone, texto }) => (
                <Motion.div
                  key={texto}
                  className="flex items-center gap-3 text-white/80 text-sm font-semibold group cursor-default"
                  whileHover={{ x: 5, color: 'rgba(255,255,255,0.95)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {icone}
                  </div>
                  {texto}
                </Motion.div>
              ))}
            </Motion.div>
          </Motion.div>
        </Motion.div>
      </AnimatePresence>

      {/* ── Lado direito — formulário ── */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2 min-h-screen lg:min-h-0">
        <AnimatePresence mode="wait">
          <Motion.div
            key={config.tipo + '-right'}
            className="bg-white rounded-3xl shadow-2xl border border-border p-8 sm:p-10 w-full max-w-100"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            {/* Logo mobile */}
            <div className="lg:hidden flex justify-center mb-7">
              <img src={logoSrc} alt="FoodExpress" className="h-12 w-auto" />
            </div>

            {/* Badge mobile */}
            <div className={`lg:hidden flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border w-fit ${config.badgeCor}`}>
              {config.badgeIcone}
              <span className={`text-xs font-bold ${config.badgeTextoCor}`}>{config.badgeTexto}</span>
            </div>

            <h2 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">
              Bem-vindo de volta!
            </h2>
            <p className="text-sm text-text-muted font-semibold mb-7">{config.subtitulo}</p>

            {/* Form */}
            <Motion.form
              onSubmit={handleEnviar}
              className="flex flex-col gap-4"
              variants={formVariants} initial="hidden" animate="show"
            >
              <Motion.div className="flex flex-col gap-1.5" variants={fieldVariant}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">E-mail</label>
                <input type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required className={inputCls} />
              </Motion.div>

              <Motion.div className="flex flex-col gap-1.5" variants={fieldVariant}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'} placeholder="••••••••"
                    value={senha} onChange={e => setSenha(e.target.value)} required
                    className="w-full px-4 py-3.5 pr-12 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal"
                  />
                  <Motion.button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary transition-colors"
                    whileTap={{ scale: 0.85 }}>
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Motion.button>
                </div>
              </Motion.div>

              <Motion.a href="#" className="text-xs text-primary font-bold self-end hover:underline" variants={fieldVariant}>
                Esqueceu a senha?
              </Motion.a>

              <Motion.button
                type="submit" disabled={carregando}
                className={`w-full py-4 text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed mt-1 ${config.ctaCls}`}
                variants={fieldVariant}
                whileHover={!carregando ? { scale: 1.02, boxShadow: '0 6px 28px rgba(0,0,0,0.18)' } : {}}
                whileTap={!carregando ? { scale: 0.97 } : {}}
              >
                {carregando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>{config.ctaTexto} <ArrowRight size={16} /></>
                )}
              </Motion.button>
            </Motion.form>

            {/* Google + Cadastro — só clientes */}
            {config.mostrarCadastro && (
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
                  <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
                </div>

                {/* Login com Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-border rounded-xl text-sm font-bold text-text-primary bg-white hover:bg-surface-2 hover:border-primary/30 transition-all mb-4"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </button>

                <p className="text-center text-sm text-text-secondary font-semibold">
                  Não tem uma conta?{' '}
                  <button onClick={() => navigate('/register/user')}
                    className="text-accent font-extrabold bg-transparent border-none cursor-pointer hover:underline">
                    Cadastre-se grátis
                  </button>
                </p>
              </Motion.div>
            )}

            {/* Alternar tipo de acesso */}
            <Motion.div
              className="mt-5 pt-4 border-t border-border flex flex-col gap-1.5 items-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            >
              {config.mostrarAlternativas && (
                <>
                  <button onClick={() => navigate('/login?parceiro=true')}
                    className="text-xs text-text-muted hover:text-secondary transition-colors bg-transparent border-none cursor-pointer font-semibold">
                    Sou parceiro (restaurante/mercado) →
                  </button>
                  <button onClick={() => navigate('/login?entregador=true')}
                    className="text-xs text-text-muted hover:text-emerald-600 transition-colors bg-transparent border-none cursor-pointer font-semibold">
                    Sou entregador →
                  </button>
                  <button onClick={() => navigate('/register/entregador')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors bg-transparent border-none cursor-pointer underline">
                    Cadastrar como entregador →
                  </button>
                </>
              )}
              {config.voltarLabel && (
                <button onClick={() => navigate('/login')}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer font-semibold">
                  {config.voltarLabel}
                </button>
              )}
            </Motion.div>
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
