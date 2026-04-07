import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Check, Store, Clock, CreditCard, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { diasSemana, formasPagamentoOpcoes } from '../../data/DadosPagina'

// aqui e o back gelado - as configurações da loja precisam ser salvas no backend

export default function ConfiguracoesGerente() {
  const { usuario } = useAuth()

  const [nomeLoja, setNomeLoja] = useState(usuario?.loja?.nome || 'Minha Loja')
  const [endereco, setEndereco] = useState(usuario?.loja?.endereco || '')
  const [taxaEntrega, setTaxaEntrega] = useState('Grátis')
  const [pedidoMinimo, setPedidoMinimo] = useState('R$ 21,00')
  const [tempoEntrega, setTempoEntrega] = useState('30-40 min')
  const [diasAberto, setDiasAberto] = useState(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'])
  const [horarioAbertura, setHorarioAbertura] = useState('18:00')
  const [horarioFechamento, setHorarioFechamento] = useState('23:00')
  const [pagamentos, setPagamentos] = useState(['Dinheiro', 'Crédito', 'Débito', 'Pix'])
  const [salvo, setSalvo] = useState(false)

  const toggleDia = (dia) => {
    setDiasAberto(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const togglePagamento = (forma) => {
    setPagamentos(prev => prev.includes(forma) ? prev.filter(f => f !== forma) : [...prev, forma])
  }

  const handleSalvar = () => {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  const inputClasse = 'w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all'
  const labelClasse = 'block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-text-primary">Configurações</h1>
        <p className="text-sm text-text-muted font-semibold mt-1">Gerencie as informações e preferências da sua loja</p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">

        {/* Informações da loja */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Store size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Informações da loja</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className={labelClasse}>Nome da loja</label>
              <input type="text" value={nomeLoja} onChange={e => setNomeLoja(e.target.value)} className={inputClasse} />
            </div>
            <div>
              <label className={labelClasse}>Endereço</label>
              <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Ex: Av. Principal, 123 - Aldeota, Fortaleza" className={inputClasse} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasse}>Taxa de entrega</label>
                <input type="text" value={taxaEntrega} onChange={e => setTaxaEntrega(e.target.value)} className={inputClasse} />
              </div>
              <div>
                <label className={labelClasse}>Pedido mínimo</label>
                <input type="text" value={pedidoMinimo} onChange={e => setPedidoMinimo(e.target.value)} className={inputClasse} />
              </div>
            </div>
            <div>
              <label className={labelClasse}>Tempo de entrega estimado</label>
              <input type="text" value={tempoEntrega} onChange={e => setTempoEntrega(e.target.value)} placeholder="Ex: 30-40 min" className={inputClasse} />
            </div>
          </div>
        </Motion.div>

        {/* Horários */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Horário de funcionamento</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className={labelClasse}>Dias de funcionamento</label>
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
                <label className={labelClasse}>Abertura</label>
                <input type="time" value={horarioAbertura} onChange={e => setHorarioAbertura(e.target.value)} className={inputClasse} />
              </div>
              <div>
                <label className={labelClasse}>Fechamento</label>
                <input type="time" value={horarioFechamento} onChange={e => setHorarioFechamento(e.target.value)} className={inputClasse} />
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Formas de pagamento */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Formas de pagamento aceitas</h3>
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

        {/* Botão salvar */}
        <Motion.button
          onClick={handleSalvar}
          className={`py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
            salvo ? 'bg-accent text-white' : 'bg-primary text-white hover:bg-primary/90'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {salvo ? <><Check size={16} /> Configurações salvas!</> : 'Salvar configurações'}
        </Motion.button>
      </div>
    </div>
  )
}
