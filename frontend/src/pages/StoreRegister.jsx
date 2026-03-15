import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Store, MapPin, Phone, User, Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

export default function CadastroLoja() {
  const [dados, setDados] = useState({ nomeLoja: '', tipoLoja: '', enderecoLoja: '', telefoneLoja: '', nomeDono: '', emailDono: '', telefoneDono: '', cpfDono: '', senha: '' })
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
    fn({ storeName: dados.nomeLoja, storeAddress: dados.enderecoLoja, storePhone: dados.telefoneLoja, ownerName: dados.nomeDono, ownerEmail: dados.emailDono, ownerPhone: dados.telefoneDono, password: dados.senha })
  }

  const handleChange = (e) => setDados({ ...dados, [e.target.name]: e.target.value })

  const inputBase = "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal"

  const Campo = ({ label, name, type = 'text', placeholder, Icon, span }) => (
    <div className={`flex flex-col gap-1.5 ${span ? 'col-span-2 sm:col-span-1' : ''}`}>
      <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">{label} *</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input name={name} type={type} placeholder={placeholder} onChange={handleChange} required className={inputBase} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-6 pb-16">
      <div className="w-full max-w-135">

        <button onClick={() => navigate('/register/user')}
          className="flex items-center gap-1.5 text-text-muted text-sm font-bold bg-transparent border-none cursor-pointer mb-6 hover:text-text-primary transition-colors">
          <ArrowLeft size={15} /> Voltar
        </button>

        <div className="text-center mb-6">
          <img src={logoSrc} alt="FoodExpress" className="h-10 w-auto mx-auto mb-5" />
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-1.5 tracking-tight">Cadastre seu estabelecimento</h1>
          <p className="text-sm text-text-muted font-semibold max-w-90 mx-auto leading-relaxed">Alcance novos clientes e gerencie seus pedidos em um só lugar</p>
        </div>

        {/* Benefícios */}
        <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5 mb-4 flex flex-col gap-2.5">
          {['Painel de controle completo e gratuito', 'Receba pedidos online 24h por dia', 'Relatórios de venda em tempo real'].map(t => (
            <div key={t} className="flex items-center gap-2.5 text-sm font-bold text-text-secondary">
              <CheckCircle size={16} className="text-accent shrink-0" /> {t}
            </div>
          ))}
        </div>

        <form onSubmit={handleEnviar}>
          {/* Card loja */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sm:p-8 mb-4">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary shrink-0"><Store size={18} /></div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Estabelecimento</h3>
                <p className="text-xs text-text-muted font-semibold">Informações que os clientes verão</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome do estabelecimento" name="nomeLoja" placeholder="Ex: Pizzaria do João" Icon={Store} span />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Tipo *</label>
                <div className="relative">
                  <Store size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
                  <select name="tipoLoja" onChange={handleChange} required className={inputBase + " appearance-none cursor-pointer"}>
                    <option value="">Selecione</option>
                    <option>🍽️ Restaurante</option>
                    <option>🍕 Pizzaria</option>
                    <option>🍔 Lanchonete</option>
                    <option>🛒 Mercado</option>
                    <option>💊 Farmácia</option>
                    <option>📦 Outros</option>
                  </select>
                </div>
              </div>

              <Campo label="Telefone da loja" name="telefoneLoja" type="tel" placeholder="(11) 99999-9999" Icon={Phone} />
              <Campo label="Endereço completo" name="enderecoLoja" placeholder="Rua, número, bairro, cidade" Icon={MapPin} span />
            </div>
          </div>

          {/* Card dono */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-secondary/8 rounded-xl flex items-center justify-center text-secondary shrink-0"><User size={18} /></div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">Dados do Responsável</h3>
                <p className="text-xs text-text-muted font-semibold">Informações do proprietário ou gerente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome completo" name="nomeDono" placeholder="Seu nome completo" Icon={User} span />
              <Campo label="E-mail" name="emailDono" type="email" placeholder="seu@email.com" Icon={Mail} />
              <Campo label="Telefone" name="telefoneDono" type="tel" placeholder="(11) 99999-9999" Icon={Phone} />
              <Campo label="CPF" name="cpfDono" placeholder="000.000.000-00" Icon={User} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wide">Senha *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <input name="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" onChange={handleChange} required
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl text-sm font-semibold text-text-primary bg-surface-2 outline-none transition-all focus:border-secondary focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,41,78,0.06)] placeholder:text-text-muted placeholder:font-normal" />
                  <button type="button" onClick={() => setMostrarSenha(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer hover:text-text-primary">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer mt-5">
              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-secondary shrink-0 cursor-pointer" />
              <span className="text-xs text-text-secondary font-semibold leading-snug">
                Concordo com os <a href="#" className="text-secondary font-bold hover:underline">Termos para Parceiros</a> e autorizo o processamento conforme a <a href="#" className="text-secondary font-bold hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <button type="submit" disabled={carregando || !aceitouTermos}
              className="mt-6 w-full py-4 bg-secondary text-white border-none rounded-xl font-display font-bold text-base cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-secondary-light hover:-translate-y-px hover:shadow-lg disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed disabled:translate-y-0">
              {carregando ? 'Cadastrando...' : (<>Cadastrar estabelecimento <ChevronRight size={18} /></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
