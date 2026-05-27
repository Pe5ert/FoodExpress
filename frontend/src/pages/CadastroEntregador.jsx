import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, Mail, Lock, Eye, EyeOff, Bike, ArrowLeft, Check, ChevronRight, FileText, AlertCircle } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import logoSrc from '../imgs/Logo-site.png'
import { mascaraTelefone } from '../utils/mascaras'
import api from '../services/api'

const beneficios = [
  { emoji: '🛵', texto: 'Aceite entregas quando quiser' },
  { emoji: '💰', texto: 'Ganhe R$ 5–15 por entrega' },
  { emoji: '⭐', texto: 'Histórico completo de avaliações' },
  { emoji: '📍', texto: 'Rotas otimizadas em tempo real' },
]


const tiposVeiculo = [
  { id: 'moto', label: 'Moto', exigePlaca: true },
  { id: 'carro', label: 'Carro', exigePlaca: true },
  { id: 'bicicleta', label: 'Bicicleta', exigePlaca: false },
]

function placaValida(placa) {
  const valor = String(placa || '').trim().toUpperCase()
  return /^[A-Z]{3}-?\d{4}$/.test(valor) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(valor)
}

function formatarPlaca(valor) {
  return String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
}


const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function CadastroEntregador() {
  const [passo, setPasso] = useState(1) // 1 = dados, 2 = veiculo, 3 = sucesso
  const [dados, setDados] = useState({
    nome: '', email: '', telefone: '',
    senha: '', veiculo: 'moto', placa: '', cnh: '',
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const { entrar } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    let valor = value
    if (name === 'telefone') valor = mascaraTelefone(value)
    if (name === 'placa') valor = formatarPlaca(value)
    if (name === 'veiculo' && value === 'bicicleta') {
      setDados({ ...dados, veiculo: value, placa: '', cnh: '' })
      return
    }
    setDados({ ...dados, [name]: valor })
  }

  const handlePasso1 = (e) => {
    e.preventDefault()
    if (!dados.nome.trim() || !dados.telefone.trim() || !dados.email.trim() || !dados.senha.trim()) {
      setErro('Preencha nome, telefone, e-mail e senha para continuar.')
      return
    }
    if (dados.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setErro('')
    setPasso(2)
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    if (dados.veiculo !== 'bicicleta') {
      if (!dados.placa.trim()) { setErro('Informe a placa do veículo. Bicicleta não precisa de placa.'); return }
      if (!placaValida(dados.placa)) { setErro('Placa inválida. Use o formato ABC1234 ou ABC1D23.'); return }
    }
    if (!aceitouTermos) { setErro('Aceite os termos para continuar.'); return }
    setErro('')
    setCarregando(true)
    try {
      const emailAuto = dados.email.trim()
      await entrar(emailAuto, 'entregador', {
        nome: dados.nome,
        telefone: dados.telefone,
        veiculo_tipo: dados.veiculo,
        veiculo_placa: dados.veiculo === 'bicicleta' ? '' : dados.placa,
        senha: dados.senha,
        cadastro: true,
      })
      setPasso(3)
    } catch (err) {
      console.error(err)
      setErro(err?.message || 'Não foi possível criar sua conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_rgba(27,153,139,0.08)] placeholder:text-text-muted placeholder:font-normal"
  const labelClass = "text-xs font-extrabold text-text-secondary uppercase tracking-wide"

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Lado esquerdo */}
      <div
        className="hidden lg:flex flex-col justify-center items-start p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg,#0c3d30 0%,#0a2d24 55%,#1B998B 100%)' }}
      >
        <div className="absolute top-[60px] right-[60px] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(27,153,139,0.2) 0%, transparent 70%)' }} />

        <button onClick={() => navigate('/')} className="absolute top-6 left-11">
          <img src={logoSrc} alt="FoodExpress" className="h-16 w-auto mb-12" />
        </button>

        <Motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <Bike size={13} /> Seja nosso parceiro entregador
          </span>
          <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Entregue no seu<br />ritmo, <span className="text-emerald-400">ganhe mais.</span>
          </h1>
          <p className="text-white/70 text-base font-medium leading-relaxed max-w-md mb-10">
            Flexibilidade total para trabalhar quando quiser e ganhar de forma justa.
          </p>
          <div className="flex flex-col gap-4">
            {beneficios.map((b, i) => (
              <Motion.div key={b.texto}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-400/20 border border-emerald-400/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {b.emoji}
                </div>
                <span className="text-white/85 text-sm font-semibold">{b.texto}</span>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-surface-2 min-h-screen lg:min-h-0">
        <Motion.div
          className="bg-white rounded-3xl shadow-2xl border border-border p-7 sm:p-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <img src={logoSrc} alt="FoodExpress" className="h-11 w-auto" />
          </div>

          <button onClick={() => passo > 1 ? setPasso(p => p - 1) : navigate('/login?entregador=true')}
            className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer mb-6 hover:text-text-primary transition-colors">
            <ArrowLeft size={15} /> {passo > 1 ? 'Voltar' : 'Voltar para login'}
          </button>

          {/* Progresso */}
          {passo < 3 && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-all ${n <= passo ? 'bg-accent text-white' : 'bg-surface-2 border border-border text-text-muted'}`}>
                    {n < passo ? <Check size={13} /> : n}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${n <= passo ? 'text-accent' : 'text-text-muted'}`}>
                    {n === 1 ? 'Dados pessoais' : 'Veículo'}
                  </span>
                  {n < 2 && <div className={`flex-1 h-0.5 rounded-full ${passo > n ? 'bg-accent' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Passo 1 — Dados pessoais */}
          {passo === 1 && (
            <form onSubmit={handlePasso1} className="flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Seus dados</h2>
                <p className="text-sm text-text-muted font-semibold">Rápido e fácil, leva menos de 2 minutos</p>
              </div>

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show">
                <label className={labelClass}>Nome completo *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="nome" type="text" placeholder="Seu nome completo"
                    value={dados.nome} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
                <label className={labelClass}>WhatsApp / Telefone *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="telefone" type="tel" placeholder="(11) 99999-9999"
                    value={dados.telefone} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
                <label className={labelClass}>E-mail *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="email" type="email" placeholder="seu@email.com"
                    value={dados.email} onChange={handleChange} required className={inputClass} />
                </div>
              </Motion.div>

              <Motion.div className="flex flex-col gap-1.5" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                <label className={labelClass}>Senha de acesso *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                    value={dados.senha} onChange={handleChange} minLength={6} required className="w-full pl-10 pr-12 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_rgba(27,153,139,0.08)] placeholder:text-text-muted placeholder:font-normal" />
                  <button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Motion.div>

              {erro && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} /> {erro}
                </div>
              )}

              <Motion.button type="submit"
                className="w-full py-4 bg-accent text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Continuar <ChevronRight size={17} />
              </Motion.button>
            </form>
          )}

          {/* Passo 2 — Veículo */}
          {passo === 2 && (
            <form onSubmit={handleCadastrar} className="flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-text-primary mb-1 tracking-tight">Seu veículo</h2>
                <p className="text-sm text-text-muted font-semibold">Informe o veículo que você usará nas entregas</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Tipo de veículo</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'moto', label: 'Moto', emoji: '🛵' },
                    { value: 'bicicleta', label: 'Bicicleta', emoji: '🚲' },
                    { value: 'carro', label: 'Carro', emoji: '🚗' },
                  ].map(v => (
                    <button key={v.value} type="button"
                      onClick={() => setDados(d => ({ ...d, veiculo: v.value, placa: v.value === 'bicicleta' ? '' : d.placa }))}
                      className={`py-3 rounded-xl border-2 text-sm font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${dados.veiculo === v.value ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-white text-text-secondary hover:border-accent/50'}`}>
                      <span className="text-xl">{v.emoji}</span>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {dados.veiculo !== 'bicicleta' ? (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Placa do veículo *</label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input name="placa" type="text" placeholder="ABC1234 ou ABC1D23"
                      value={dados.placa} onChange={handleChange} className={inputClass} />
                  </div>
                  <p className="text-xs text-text-muted">Validação local de formato. Consulta real em base oficial exige integração autenticada com órgão de trânsito.</p>
                </div>
              ) : (
                <div className="text-xs text-accent font-semibold bg-accent/10 border border-accent/20 rounded-xl px-3 py-2">
                  Bicicleta selecionada: placa não é necessária.
                </div>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-accent shrink-0 cursor-pointer" />
                <span className="text-xs text-text-secondary font-semibold leading-snug">
                  Li e aceito os <Link to="/termos-parceiros" target="_blank" rel="noreferrer" className="text-accent font-bold hover:underline">Termos para Entregadores</Link> e a <Link to="/politica-privacidade" target="_blank" rel="noreferrer" className="text-accent font-bold hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              {erro && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} /> {erro}
                </div>
              )}

              <Motion.button type="submit" disabled={carregando}
                className="w-full py-4 bg-accent text-white border-none rounded-xl font-display font-bold text-base cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {carregando ? 'Criando conta...' : <><Check size={17} /> Criar conta de entregador</>}
              </Motion.button>
            </form>
          )}

          {/* Passo 3 — Sucesso */}
          {passo === 3 && (
            <Motion.div
              className="flex flex-col items-center text-center py-6 gap-5"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                <span className="text-4xl">🛵</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-extrabold text-text-primary mb-2">Bem-vindo, {dados.nome.split(' ')[0]}!</h3>
                <p className="text-sm text-text-muted font-semibold leading-relaxed">
                  Sua conta foi criada com sucesso.<br />Agora é só ficar online e receber pedidos!
                </p>
              </div>
              <button
                onClick={() => navigate('/entregador')}
                className="w-full py-4 bg-accent text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2"
              >
                <Bike size={18} /> Ir para meu painel
              </button>
            </Motion.div>
          )}

          {passo < 3 && (
            <p className="text-center text-xs text-text-muted font-semibold mt-5">
              Já tem conta?{' '}
              <button onClick={() => navigate('/login?entregador=true')} className="text-accent font-bold bg-transparent border-none cursor-pointer hover:underline">
                Entrar
              </button>
            </p>
          )}
        </Motion.div>
      </div>
    </div>
  )
}
