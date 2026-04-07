import { useState, createElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, MapPin, Phone, User, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, CheckCircle, Building2 } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { mascaraTelefone, mascaraCNPJ, mascaraCPF } from '../utils/mascaras'
import { tiposCadastroEstabelecimento } from '../data/DadosPagina'

// aqui e o back gelado - tipos de estabelecimento devem ser carregados do backend ou CMS

// ─── Campo fora do componente principal — OBRIGATÓRIO para não perder foco ───
// Se ficar dentro, o React recria o componente a cada keystroke e desmonta o input
const inputBase = "w-full pl-10 pr-4 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal"

function Campo({ label, name, type = 'text', placeholder, Icon: IconComponent, span, value, onChange, required = true }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {createElement(IconComponent, { size: 14, className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none' })}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={inputBase}
        />
      </div>
    </div>
  )
}

// Variantes de animação reutilizáveis
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

export default function CadastroLoja() {
  const [dados, setDados] = useState({
    nomeLoja: '', tipoLoja: '', cnpjLoja: '', enderecoLoja: '', telefoneLoja: '',
    nomeDono: '', emailDono: '', telefoneDono: '', cpfDono: '', senha: '',
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const { cadastrarGerente } = useAuth()
  const navigate = useNavigate()

  const handleEnviar = (e) => {
    e.preventDefault()
    if (!aceitouTermos) return
    setCarregando(true)
    const fn = cadastrarGerente
    fn({
      storeName: dados.nomeLoja, storeAddress: dados.enderecoLoja,
      storePhone: dados.telefoneLoja, storeCnpj: dados.cnpjLoja,
      ownerName: dados.nomeDono, ownerEmail: dados.emailDono,
      ownerPhone: dados.telefoneDono, ownerCpf: dados.cpfDono, password: dados.senha,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let valor = value
    if (name === 'telefoneLoja' || name === 'telefoneDono') valor = mascaraTelefone(value)
    if (name === 'cnpjLoja') valor = mascaraCNPJ(value)
    if (name === 'cpfDono') valor = mascaraCPF(value)
    setDados({ ...dados, [name]: valor })
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <Motion.div
        className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para login
        </button>
        <span className="text-sm font-bold text-text-secondary ml-auto hidden sm:block">Cadastro de Parceiro</span>
      </Motion.div>

      <div className="max-w-135 mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* Título */}
        <Motion.div
          className="mb-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
            Cadastre seu estabelecimento
          </h1>
          <p className="text-sm text-text-muted font-semibold">
            Alcance novos clientes e gerencie seus pedidos em um só lugar
          </p>
        </Motion.div>

        {/* Benefícios */}
        <Motion.div
          className="bg-accent/5 border border-accent/15 rounded-2xl p-4 mb-6"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { texto: 'Painel completo e gratuito', delay: 0.25 },
              { texto: 'Pedidos online 24h por dia', delay: 0.32 },
              { texto: 'Relatórios em tempo real', delay: 0.39 },
            ].map(({ texto, delay }) => (
              <Motion.div
                key={texto}
                className="flex items-center gap-2 text-sm font-bold text-text-secondary"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay }}
              >
                <CheckCircle size={15} className="text-accent shrink-0" /> {texto}
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        <form onSubmit={handleEnviar} className="flex flex-col gap-4">

          {/* Card — Dados da Loja */}
          <Motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <Motion.div
                className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-primary shrink-0"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              >
                <Store size={17} />
              </Motion.div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Estabelecimento</h3>
                <p className="text-xs text-text-muted font-semibold">Informações visíveis para os clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo
                label="Nome do estabelecimento" name="nomeLoja"
                placeholder="Ex: Pizzaria do João" Icon={Store} span
                value={dados.nomeLoja} onChange={handleChange}
              />

              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">Tipo *</label>
                <div className="relative">
                  <Store size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
                  <select name="tipoLoja" value={dados.tipoLoja} onChange={handleChange} required
                    className={inputBase + ' appearance-none cursor-pointer'}>
                    <option value="">Selecione o tipo</option>
                    {tiposCadastroEstabelecimento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">CNPJ *</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="cnpjLoja" type="text" placeholder="00.000.000/0001-00"
                    value={dados.cnpjLoja} onChange={handleChange} required className={inputBase} />
                </div>
              </div>

              <Campo
                label="Telefone da loja" name="telefoneLoja"
                type="tel" placeholder="(11) 99999-9999" Icon={Phone}
                value={dados.telefoneLoja} onChange={handleChange}
              />
              <Campo
                label="Endereço completo" name="enderecoLoja"
                placeholder="Rua, número, bairro, cidade" Icon={MapPin} span
                value={dados.enderecoLoja} onChange={handleChange}
              />
            </div>
          </Motion.div>

          {/* Card — Dados do Dono */}
          <Motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <Motion.div
                className="w-9 h-9 bg-secondary/8 rounded-xl flex items-center justify-center text-secondary shrink-0"
                initial={{ scale: 0, rotate: 15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.42 }}
              >
                <User size={17} />
              </Motion.div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Responsável</h3>
                <p className="text-xs text-text-muted font-semibold">Proprietário ou gerente da loja</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome completo" name="nomeDono" placeholder="Seu nome completo" Icon={User} span value={dados.nomeDono} onChange={handleChange} />
              <Campo label="E-mail" name="emailDono" type="email" placeholder="seu@email.com" Icon={Mail} value={dados.emailDono} onChange={handleChange} />
              <Campo label="Telefone" name="telefoneDono" type="tel" placeholder="(11) 99999-9999" Icon={Phone} value={dados.telefoneDono} onChange={handleChange} />
              <Campo label="CPF" name="cpfDono" placeholder="000.000.000-00" Icon={User} value={dados.cpfDono} onChange={handleChange} />

              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">Senha de acesso *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="senha" type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={dados.senha} onChange={handleChange} required
                    className="w-full pl-10 pr-12 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal"
                  />
                  <button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer mt-5">
              <input type="checkbox" checked={aceitouTermos}
                onChange={e => setAceitouTermos(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-secondary shrink-0 cursor-pointer" />
              <span className="text-xs text-text-secondary font-semibold leading-snug">
                Concordo com os{' '}
                <a href="#" className="text-secondary font-bold hover:underline">Termos para Parceiros</a>
                {' '}e autorizo o processamento conforme a{' '}
                <a href="#" className="text-secondary font-bold hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <Motion.button
              type="submit"
              disabled={carregando || !aceitouTermos}
              className="mt-6 w-full py-4 bg-secondary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
              whileHover={!carregando && aceitouTermos ? { scale: 1.02, boxShadow: '0 8px 24px rgba(46,41,78,0.35)' } : {}}
              whileTap={!carregando && aceitouTermos ? { scale: 0.97 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {carregando ? (
                <Motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  Cadastrando...
                </Motion.span>
              ) : (
                <>Cadastrar estabelecimento <ChevronRight size={18} /></>
              )}
            </Motion.button>
          </Motion.div>
        </form>
      </div>
    </div>
  )
}
