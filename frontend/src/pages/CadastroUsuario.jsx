import { useState } from 'react'
import { mascaraTelefone } from '../utils/mascaras'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Phone, ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
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
  const [erro, setErro] = useState('')
  const { cadastrarCliente, aplicarSessao } = useAuth()
  const navigate = useNavigate()

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!aceitouTermos) return
    if (!dados.nome.trim()) return
    if (!dados.email.trim()) return
    if (dados.telefone.replace(/\D/g, '').length < 10) {
      setErro('Informe um telefone válido para o entregador conseguir entrar em contato.')
      return
    }
    if (dados.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)
    setErro('')
    try {
      const resposta = await cadastrarCliente({ nome: dados.nome, email: dados.email, telefone: dados.telefone, senha: dados.senha })
      aplicarSessao(resposta.token, resposta.usuario)
    } catch (err) {
      console.error(err)
      setErro(err?.message || 'Não foi possível criar sua conta.')
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
            Crie sua conta<br />no <span className="text-yellow-300">FoodExpress</span>
          </h1>
          <p className="text-white/75 text-base font-medium leading-relaxed max-w-85">
            Use seu e-mail para criar uma conta com segurança.
          </p>
        </Motion.div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2 min-h-screen lg:min-h-0">
        <Motion.div
          className="bg-white rounded-3xl shadow-2xl border border-border p-7 sm:p-10 w-full max-w-[26rem]"
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
          <p className="text-sm text-text-muted font-semibold mb-5">Cadastre e acesse com e-mail e senha</p>

          {erro && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {erro}
            </div>
          )}

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

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">E-mail *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="email" type="email" placeholder="seu@email.com"
                    value={dados.email} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>
              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Telefone *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="telefone" type="tel" placeholder="(11) 99999-9999"
                    value={dados.telefone} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Senha *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                    value={dados.senha} onChange={handleChange} minLength={6} required
                    className="w-full pl-10 pr-12 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.08)] placeholder:text-text-muted placeholder:font-normal" />
                  <button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Motion.div>

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
                {carregando ? 'Criando conta...' : 'Criar conta'}
              </Motion.button>
            </form>

          <div className="flex items-center gap-4 my-5 text-text-muted text-xs font-bold">
            <div className="flex-1 h-px bg-border" /> já tem conta? <div className="flex-1 h-px bg-border" />
          </div>

          <button type="button" onClick={() => navigate('/login')}
            className="w-full py-3 bg-transparent border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary-light">
            Entrar na minha conta
          </button>

        </Motion.div>
      </div>
    </div>
  )
}
