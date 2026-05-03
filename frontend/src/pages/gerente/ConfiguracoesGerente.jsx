import { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { Check, Store, Clock, CreditCard, Sun, Moon, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useDarkMode } from '../../contexts/DarkModeContext'
import api from '../../services/api'

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const formasPagamentoOpcoes = ['Dinheiro', 'Crédito', 'Débito', 'Pix', 'Vale Refeição']

export default function ConfiguracoesGerente() {
  const { usuario } = useAuth()
  const { dark, toggle } = useDarkMode()

  const [restauranteId, setRestauranteId] = useState(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [categoria, setCategoria] = useState('')

  const [diasAberto, setDiasAberto] = useState(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'])
  const [horarioAbertura, setHorarioAbertura] = useState('18:00')
  const [horarioFechamento, setHorarioFechamento] = useState('23:00')
  const [pagamentos, setPagamentos] = useState(['Dinheiro', 'Crédito', 'Débito', 'Pix'])

  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const usr = usuario || JSON.parse(localStorage.getItem('usuario') || '{}')
    if (!usr?.email) { setCarregando(false); return }

    api.restaurantes.meuRestauranteOuCriar(usr.email, usr.nome || usr.email)
      .then(rest => {
        setRestauranteId(rest.id)
        setNome(rest.nome || '')
        setEmail(rest.email || '')
        setTelefone(rest.telefone || '')
        setEndereco(rest.endereco || '')
        setCategoria(rest.categoria || '')
      })
      .catch(err => {
        // Backend offline ou token inválido — mostra formulário vazio sem bloquear
        console.warn('Não foi possível carregar restaurante:', err)
        setErro('Backend offline. Os dados serão sincronizados quando o servidor estiver disponível.')
      })
      .finally(() => setCarregando(false))
  }, [usuario])

  const toggleDia = (dia) =>
    setDiasAberto(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])

  const togglePagamento = (forma) =>
    setPagamentos(prev => prev.includes(forma) ? prev.filter(f => f !== forma) : [...prev, forma])

  const handleSalvar = async () => {
    if (!restauranteId) {
      setErro('Restaurante não encontrado. Faça login novamente.')
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      await api.restaurantes.atualizar(restauranteId, {
        nome: nome || undefined,
        email: email || undefined,
        telefone: telefone || undefined,
        endereco: endereco || undefined,
        categoria: categoria || undefined,
      })
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch (e) {
      setErro('Erro ao salvar: ' + (e.message || 'tente novamente'))
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all'
  const labelCls = 'block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5'

  if (carregando) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-text-primary">Configurações</h1>
        </div>
        <div className="flex flex-col gap-4 max-w-2xl">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-surface-2 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-text-primary">Configurações</h1>
        <p className="text-sm text-text-muted font-semibold mt-1">Gerencie as informações da sua loja</p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">

        {/* Aparência */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            {dark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            <h3 className="font-display text-base font-bold text-text-primary">Aparência</h3>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">Modo escuro</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Aplica em todas as páginas do sistema</p>
            </div>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer border-none ${dark ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Motion.div>

        {/* Informações da loja */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Store size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Informações da loja</h3>
            {restauranteId && (
              <span className="ml-auto text-xs text-text-muted font-semibold">ID: {String(restauranteId).slice(0, 12)}…</span>
            )}
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className={labelCls}>Nome da loja *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Pizzaria do João" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="contato@loja.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telefone</label>
                <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)}
                  placeholder="(85) 99999-9999" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Endereço</label>
              <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)}
                placeholder="Ex: Av. Principal, 123 - Aldeota, Fortaleza" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categoria</label>
              <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)}
                placeholder="Ex: Pizzas, Hambúrgueres, Japonesa…" className={inputCls} />
            </div>
          </div>
        </Motion.div>

        {/* Horários */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Horário de funcionamento</h3>
            <span className="ml-auto text-xs text-text-muted font-semibold italic">Salvo localmente</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className={labelCls}>Dias de funcionamento</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {diasSemana.map(dia => (
                  <button key={dia} onClick={() => toggleDia(dia)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      diasAberto.includes(dia)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                    }`}>
                    {dia}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Abertura</label>
                <input type="time" value={horarioAbertura} onChange={e => setHorarioAbertura(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fechamento</label>
                <input type="time" value={horarioFechamento} onChange={e => setHorarioFechamento(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Formas de pagamento */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Formas de pagamento aceitas</h3>
            <span className="ml-auto text-xs text-text-muted font-semibold italic">Salvo localmente</span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {formasPagamentoOpcoes.map(forma => (
                <button key={forma} onClick={() => togglePagamento(forma)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    pagamentos.includes(forma)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-text-secondary border-border hover:border-accent hover:text-accent'
                  }`}>
                  {forma}
                </button>
              ))}
            </div>
          </div>
        </Motion.div>

        {/* Erro */}
        {erro && (
          <div className="text-red-500 text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            ⚠️ {erro}
          </div>
        )}

        {/* Botão salvar */}
        <Motion.button
          onClick={handleSalvar}
          disabled={salvando || !restauranteId}
          className={`py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 border-none ${
            salvo ? 'bg-accent text-white' : 'bg-primary text-white hover:bg-primary/90'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {salvo
            ? <><Check size={16} /> Configurações salvas com sucesso!</>
            : salvando
              ? 'Salvando...'
              : 'Salvar configurações da loja'}
        </Motion.button>
      </div>
    </div>
  )
}
