import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, CreditCard, CheckCircle, ArrowLeft, Clock } from 'lucide-react'




// aqui e o back gelado - formas de pagamento, endereços e etapas devem vir do backend
const formasPagamento = checkoutFormasPagamento
const enderecosMock = enderecosCheckoutExemplo

// Tela de confirmação / rastreamento do pedido
function TelaPedidoConfirmado({ numero, onVoltar }) {
  const etapas = etapasCheckoutExemplo

  return (
    <Motion.div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <Motion.div
        className="bg-white rounded-3xl border border-border shadow-lg p-8 w-full max-w-md text-center"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
      >
        <Motion.div
          className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
        >
          <CheckCircle size={40} className="text-accent" />
        </Motion.div>

        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">Pedido realizado!</h1>
        <p className="text-text-muted font-semibold text-sm mb-1">Pedido <strong className="text-text-primary">{numero}</strong></p>
        <p className="text-text-muted font-semibold text-sm mb-6">
          Tempo estimado: <strong className="text-primary">30-40 min</strong>
        </p>

        {/* Etapas */}
        <div className="flex flex-col gap-0 text-left mb-8">
          {etapas.map((etapa, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  etapa.concluido ? 'bg-accent text-white' : 'bg-surface-2 border border-border text-text-muted'
                }`}>
                  <etapa.icone size={15} />
                </div>
                {i < etapas.length - 1 && (
                  <div className={`w-0.5 h-6 mt-0.5 ${etapa.concluido && etapas[i+1].concluido ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
              <p className={`text-sm font-semibold pt-1.5 ${etapa.concluido ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
                {etapa.label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onVoltar}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all"
        >
          Voltar ao início
        </button>
      </Motion.div>
    </Motion.div>
  )
}

export default function Checkout() {
  const { itens, totalCarrinho, limparCarrinho } = useCart()
  const { estaLogado } = useAuth()
  const navigate = useNavigate()

  const [enderecoSelecionado, setEnderecoSelecionado] = useState(enderecosMock[0].id)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('pix')
  const [troco, setTroco] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)

  const taxaEntrega = totalCarrinho >= 50 ? 0 : 5.99
  const total = totalCarrinho + taxaEntrega
  // Gera o número do pedido somente quando o usuário confirmar o checkout

  const handleConfirmar = () => {
    if (!estaLogado) { navigate('/login'); return }
    if (itens.length === 0) return
    setCarregando(true)
    const numeroPedido = '#' + Math.floor(9000 + Math.random() * 999)
    // Simula o envio do pedido (será substituído pelo fetch real ao backend)
    setTimeout(() => {
      limparCarrinho()
      setPedidoConfirmado(numeroPedido)
      setCarregando(false)
    }, 1500)
  }

  if (pedidoConfirmado) {
    return <TelaPedidoConfirmado numero={pedidoConfirmado} onVoltar={() => navigate('/')} />
  }

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="font-display text-xl font-bold text-text-primary mb-2">Seu carrinho está vazio</h2>
        <p className="text-text-muted font-semibold text-sm mb-6">Adicione itens antes de finalizar o pedido.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all">
          Ver restaurantes
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabeçalho */}
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
            <ArrowLeft size={16} className="text-text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-text-primary">Finalizar pedido</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Endereço de entrega */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Endereço de entrega</h3>
          </div>
          <div className="p-2">
            {enderecosMock.map(end => (
              <button key={end.id} onClick={() => setEnderecoSelecionado(end.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  enderecoSelecionado === end.id ? 'bg-primary-light border border-primary/20' : 'hover:bg-surface-2'
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  enderecoSelecionado === end.id ? 'border-primary' : 'border-border'
                }`}>
                  {enderecoSelecionado === end.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{end.label}</p>
                  <p className="text-xs text-text-muted font-semibold">{end.rua} · {end.bairro} · {end.cidade}</p>
                </div>
              </button>
            ))}
          </div>
        </Motion.div>

        {/* Forma de pagamento */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Forma de pagamento</h3>
          </div>
          <div className="p-2">
            {formasPagamento.map(fp => (
              <button key={fp.id} onClick={() => setPagamentoSelecionado(fp.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  pagamentoSelecionado === fp.id ? 'bg-primary-light border border-primary/20' : 'hover:bg-surface-2'
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  pagamentoSelecionado === fp.id ? 'border-primary' : 'border-border'
                }`}>
                  {pagamentoSelecionado === fp.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <fp.icone size={16} className="text-text-secondary shrink-0" />
                <div>
                  <p className="text-sm font-bold text-text-primary">{fp.label}</p>
                  <p className="text-xs text-text-muted font-semibold">{fp.descricao}</p>
                </div>
              </button>
            ))}

            {pagamentoSelecionado === 'dinheiro' && (
              <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-3 pb-3">
                <label className="block text-xs font-bold text-text-muted mb-1.5 mt-2">Troco para quanto? (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: R$ 100,00"
                  value={troco}
                  onChange={e => setTroco(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all"
                />
              </Motion.div>
            )}
          </div>
        </Motion.div>

        {/* Resumo do pedido */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display text-base font-bold text-text-primary">Resumo do pedido</h3>
          </div>
          <div className="p-5 flex flex-col gap-2">
            {itens.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary font-semibold">
                  {item.quantidade}x {item.name || item.nome}
                </span>
                <span className="font-bold text-text-primary">
                  R$ {((item.price || item.preco) * item.quantidade).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-3 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm text-text-secondary font-semibold">
                <span>Subtotal</span>
                <span>R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-text-secondary font-semibold">
                <span>Taxa de entrega</span>
                <span className={taxaEntrega === 0 ? 'text-accent font-bold' : ''}>
                  {taxaEntrega === 0 ? 'Grátis' : `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-text-primary border-t border-border pt-2 mt-1">
                <span>Total</span>
                <span className="text-accent">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Tempo estimado */}
        <div className="flex items-center gap-2 text-sm text-text-muted font-semibold bg-white border border-border rounded-xl px-4 py-3">
          <Clock size={15} className="text-primary shrink-0" />
          Tempo estimado de entrega: <strong className="text-text-primary">30-40 minutos</strong>
        </div>

        {/* Botão confirmar */}
        <Motion.button
          onClick={handleConfirmar}
          disabled={carregando}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          {carregando ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Confirmando...
            </span>
          ) : (
            <>Confirmar pedido · R$ {total.toFixed(2).replace('.', ',')}</>
          )}
        </Motion.button>
      </main>
    </div>
  )
}
