import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, MapPin, Phone, User, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, CheckCircle, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import logoSrc from '../imgs/Logo-site.png'

export default function CadastroLoja() {
  const [dados, setDados] = useState({
    nomeLoja: '', tipoLoja: '', cnpjLoja: '', enderecoLoja: '', telefoneLoja: '',
    nomeDono: '', emailDono: '', telefoneDono: '', cpfDono: '', senha: '',
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const { cadastrarGerente, signupGerente } = useAuth()
  const navigate = useNavigate()

  const handleEnviar = (e) => {
    e.preventDefault()
    if (!aceitouTermos) return
    setCarregando(true)
    const fn = cadastrarGerente || signupGerente
    fn({
      storeName: dados.nomeLoja, storeAddress: dados.enderecoLoja,
      storePhone: dados.telefoneLoja, storeCnpj: dados.cnpjLoja,
      ownerName: dados.nomeDono, ownerEmail: dados.emailDono,
      ownerPhone: dados.telefoneDono, ownerCpf: dados.cpfDono, password: dados.senha,
    })
  }

  const handleChange = (e) => setDados({ ...dados, [e.target.name]: e.target.value })

  const inputBase = "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal"

  const Campo = ({ label, name, type = 'text', placeholder, Icon, span }) => (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">{label} *</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input name={name} type={type} placeholder={placeholder} onChange={handleChange} required className={inputBase} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">

      {/* Header simples */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/register/user')}
          className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
        </button>
        <img src={logoSrc} alt="FoodExpress" className="h-9 w-auto" />
        <span className="text-sm font-bold text-text-secondary ml-auto hidden sm:block">Cadastro de Parceiro</span>
      </div>

      <div className="max-w-135 mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* Título */}
        <motion.div className="mb-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
            Cadastre seu estabelecimento
          </h1>
          <p className="text-sm text-text-muted font-semibold">Alcance novos clientes e gerencie seus pedidos em um só lugar</p>
        </motion.div>

        {/* Benefícios */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-accent/5 border border-accent/15 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Painel completo e gratuito', 'Pedidos online 24h por dia', 'Relatórios em tempo real'].map((t, i) => (
            <div key={t} className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <CheckCircle size={15} className="text-accent shrink-0" /> {t}
            </div>
          ))}
        </motion.div>

        <form onSubmit={handleEnviar} className="flex flex-col gap-4">

          {/* Card — Dados da Loja */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-primary shrink-0">
                <Store size={17} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Estabelecimento</h3>
                <p className="text-xs text-text-muted font-semibold">Informações visíveis para os clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome do estabelecimento" name="nomeLoja" placeholder="Ex: Pizzaria do João" Icon={Store} span />

              {/* Tipo */}
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">Tipo *</label>
                <div className="relative">
                  <Store size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
                  <select name="tipoLoja" onChange={handleChange} required className={inputBase + ' appearance-none cursor-pointer'}>
                    <option value="">Selecione o tipo</option>
                    <option value="restaurante">🍽️ Restaurante</option>
                    <option value="pizzaria">🍕 Pizzaria</option>
                    <option value="lanchonete">🍔 Lanchonete</option>
                    <option value="mercado">🛒 Mercado</option>
                    <option value="farmacia">💊 Farmácia</option>
                    <option value="padaria">🥖 Padaria</option>
                    <option value="outros">📦 Outros</option>
                  </select>
                </div>
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">CNPJ *</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="cnpjLoja" type="text" placeholder="00.000.000/0001-00" onChange={handleChange} required className={inputBase} />
                </div>
              </div>

              <Campo label="Telefone da loja" name="telefoneLoja" type="tel" placeholder="(11) 99999-9999" Icon={Phone} />
              <Campo label="Endereço completo" name="enderecoLoja" placeholder="Rua, número, bairro, cidade" Icon={MapPin} span />
            </div>
          </motion.div>

          {/* Card — Dados do Dono */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="w-9 h-9 bg-secondary/8 rounded-xl flex items-center justify-center text-secondary shrink-0">
                <User size={17} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Responsável</h3>
                <p className="text-xs text-text-muted font-semibold">Proprietário ou gerente da loja</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome completo" name="nomeDono" placeholder="Seu nome completo" Icon={User} span />
              <Campo label="E-mail" name="emailDono" type="email" placeholder="seu@email.com" Icon={Mail} />
              <Campo label="Telefone" name="telefoneDono" type="tel" placeholder="(11) 99999-9999" Icon={Phone} />
              <Campo label="CPF" name="cpfDono" placeholder="000.000.000-00" Icon={User} />

              {/* Senha */}
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wide mb-1.5">Senha de acesso *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                    onChange={handleChange} required
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal" />
                  <button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Termos */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-5">
              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-secondary shrink-0 cursor-pointer" />
              <span className="text-xs text-text-secondary font-semibold leading-snug">
                Concordo com os <a href="#" className="text-secondary font-bold hover:underline">Termos para Parceiros</a> e autorizo o processamento conforme a <a href="#" className="text-secondary font-bold hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <motion.button type="submit" disabled={carregando || !aceitouTermos}
              className="mt-6 w-full py-4 bg-secondary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer flex items-center justify-center gap-2 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(46,41,78,0.3)' }}
              whileTap={{ scale: 0.98 }}>
              {carregando ? 'Cadastrando...' : (<>Cadastrar estabelecimento <ChevronRight size={18} /></>)}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
