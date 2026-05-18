import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, CreditCard, CheckCircle, ArrowLeft, Clock, Tag, X, QrCode, Banknote, ReceiptText, Copy, Bike, ShieldCheck } from 'lucide-react'
import api from '../services/api'
import { motion as Motion, AnimatePresence } from 'framer-motion'

const formasPagamento = [
  { id: 'pix',      label: 'Pix',              descricao: 'QR Code gerado na hora', Icon: QrCode },
  { id: 'cartao',   label: 'Cartão',           descricao: 'Maquininha com o entregador', Icon: CreditCard },
  { id: 'dinheiro', label: 'Dinheiro',         descricao: 'Pague na entrega', Icon: Banknote },
  { id: 'boleto',   label: 'Boleto',           descricao: 'Linha digitável para pagamento', Icon: ReceiptText },
]

function gerarCodigoPix(total) {
  const valor = Number(total || 0).toFixed(2)
  return `00020126580014BR.GOV.BCB.PIX0136foodexpress-pix-demo520400005303986540${valor.length}${valor}5802BR5911FoodExpress6009Sao Paulo62170513FOODEXPRESS6304A1B2`
}

function gerarLinhaBoleto(total) {
  const centavos = String(Math.round(Number(total || 0) * 100)).padStart(10, '0')
  return `34191.79001 01043.510047 91020.150008 8 ${centavos}`
}

function QrPixVisual({ codigo, imagem }) {
  const pontos = useMemo(() => {
    const tamanho = 17
    return Array.from({ length: tamanho * tamanho }, (_, index) => {
      const x = index % tamanho
      const y = Math.floor(index / tamanho)
      const marcador =
        (x < 5 && y < 5) ||
        (x > 11 && y < 5) ||
        (x < 5 && y > 11)
      if (marcador) return x === 0 || y === 0 || x === 4 || y === 4 || (x === 2 && y === 2)
      const charCode = codigo.charCodeAt((index * 7) % codigo.length)
      return (charCode + x * 3 + y * 5 + index) % 4 !== 0
    })
  }, [codigo])

  return imagem ? (
    <img
      src={imagem}
      alt="QR Code Pix"
      className="w-[142px] h-[142px] rounded-xl border border-border bg-white p-2 object-contain shadow-sm"
    />
  ) : (
    <div className="grid grid-cols-[repeat(17,6px)] gap-1 rounded-xl border border-border bg-white p-3 shadow-sm">
      {pontos.map((ativo, index) => (
        <span key={index} className={`w-1.5 h-1.5 rounded-[2px] ${ativo ? 'bg-text-primary' : 'bg-transparent'}`} />
      ))}
    </div>
  )
}

function TelaPedidoConfirmado({ numero, onVoltar }) {
  const etapas = [
    { label: 'Pedido confirmado',   concluido: true,  Icon: CheckCircle },
    { label: 'Preparando seu pedido', concluido: true, Icon: Clock },
    { label: 'Saiu para entrega',   concluido: false, Icon: CheckCircle },
    { label: 'Entregue',            concluido: false, Icon: CheckCircle },
  ]
  return (
    <Motion.div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Motion.div className="bg-white rounded-3xl border border-border shadow-lg p-8 w-full max-w-md text-center"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Motion.div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
          <CheckCircle size={40} className="text-accent" />
        </Motion.div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary mb-1">Pedido realizado!</h1>
        <p className="text-text-muted font-semibold text-sm mb-1">Pedido <strong className="text-text-primary">{numero}</strong></p>
        <p className="text-text-muted font-semibold text-sm mb-6">
          Tempo estimado: <strong className="text-primary">30-40 min</strong>
        </p>
        <div className="flex flex-col gap-0 text-left mb-8">
          {etapas.map((etapa, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  etapa.concluido ? 'bg-accent text-white' : 'bg-surface-2 border border-border text-text-muted'
                }`}>
                  <etapa.Icon size={15} />
                </div>
                {i < etapas.length - 1 && (
                  <div className={`w-0.5 h-6 mt-0.5 ${etapa.concluido && etapas[i+1]?.concluido ? 'bg-accent' : 'bg-border'}`} />
                )}
              </div>
              <p className={`text-sm font-semibold pt-1.5 ${etapa.concluido ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
                {etapa.label}
              </p>
            </div>
          ))}
        </div>
        <button onClick={onVoltar}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all border-none">
          Voltar ao início
        </button>
      </Motion.div>
    </Motion.div>
  )
}

export default function Checkout() {
  const { itens, totalCarrinho, limparCarrinho } = useCart()
  const { estaLogado, usuario } = useAuth()
  const navigate = useNavigate()

  const [enderecoPrincipal, setEnderecoPrincipal] = useState('')
  const [enderecoCustom, setEnderecoCustom] = useState('')
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('pix')
  const [troco, setTroco] = useState('')
  const [cupom, setCupom] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState(null)
  const [cupomErro, setCupomErro] = useState('')
  const [localizacao, setLocalizacao] = useState(null)
  const [localizacaoStatus, setLocalizacaoStatus] = useState('')
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)
  const [erro, setErro] = useState('')
  const [codigoCopiado, setCodigoCopiado] = useState('')

  useEffect(() => {
    api.clientes.meuPerfil()
      .then(cliente => { if (cliente?.endereco_principal) setEnderecoPrincipal(cliente.endereco_principal) })
      .catch(() => {})

    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('localizacao')
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation)
          if (parsed?.latitude && parsed?.longitude) {
            setLocalizacao(parsed)
            if (!enderecoCustom) {
              setEnderecoCustom(`Minha localização atual (${parsed.latitude.toFixed(5)}, ${parsed.longitude.toFixed(5)})`)
            }
          }
        } catch (err) {
          // ignore invalid storage
        }
      }
    }
  }, [])

  const taxaEntregaBase = totalCarrinho >= 50 ? 0 : 5.99
  const cupomFreteGratis = Boolean(cupomAplicado?.frete_gratis || cupomAplicado?.tipo === 'frete_gratis')
  const taxaEntrega = cupomFreteGratis ? 0 : taxaEntregaBase
  const desconto = cupomAplicado && !cupomFreteGratis ? (() => {
    const descontoValor = Number(cupomAplicado.desconto_valor)
    if (Number.isFinite(descontoValor)) return Math.max(0, descontoValor)

    const percentual = Number(
      cupomAplicado.desconto_percentual ??
      (cupomAplicado.tipo === 'percentual' ? cupomAplicado.desconto : 0)
    )
    if (Number.isFinite(percentual) && percentual > 0) return (totalCarrinho * percentual) / 100

    const fixo = Number(cupomAplicado.desconto)
    return Number.isFinite(fixo) ? fixo : 0
  })() : 0
  const total = Math.max(0, totalCarrinho + taxaEntrega - desconto)
  const valorTotalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`
  const imagemQrPix = import.meta.env.VITE_PIX_QR_CODE_URL || ''
  const codigoPix = useMemo(() => gerarCodigoPix(total), [total])
  const linhaBoleto = useMemo(() => gerarLinhaBoleto(total), [total])
  const cupomDescricao = cupomAplicado
    ? cupomFreteGratis
      ? 'Frete grátis aplicado'
      : cupomAplicado.tipo === 'fixo'
        ? `Desconto de R$ ${desconto.toFixed(2).replace('.', ',')}`
        : `${Number(cupomAplicado.desconto_percentual ?? cupomAplicado.desconto ?? 0)}% de desconto — economizando R$ ${desconto.toFixed(2).replace('.', ',')}`
    : ''

  const copiarCodigoPagamento = async (tipo, codigo) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCodigoCopiado(tipo)
      setTimeout(() => setCodigoCopiado(''), 1800)
    } catch {
      setCodigoCopiado('')
    }
  }

  const enderecoFinal = enderecoCustom.trim() || enderecoPrincipal || (localizacao ? 'Minha localização atual' : 'Endereço não informado')

  const validarCupom = async (codigoInformado) => {
    const codigoNormalizado = String(codigoInformado || '').trim().toUpperCase()
    if (!codigoNormalizado) return

    setCupom(codigoNormalizado)
    setCupomErro('')
    try {
      const r = await api.cupons.validar(codigoNormalizado, totalCarrinho, taxaEntregaBase)
      setCupomAplicado(r)
    } catch (e) {
      setCupomErro(e.message || 'Cupom inválido')
      setCupomAplicado(null)
    }
  }

  const aplicarCupom = () => validarCupom(cupom)

  useEffect(() => {
    if (totalCarrinho <= 0 || cupomAplicado) return
    const cupomPromocional = localStorage.getItem('cupomPromocional')
    if (!cupomPromocional) return
    localStorage.removeItem('cupomPromocional')
    validarCupom(cupomPromocional)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCarrinho])

  const getRegionName = (lat, lng) => {
    if (lat >= -23.70 && lat <= -23.45 && lng >= -46.70 && lng <= -46.45) return 'São Paulo'
    if (lat >= -23.65 && lat <= -23.55 && lng >= -46.75 && lng <= -46.60) return 'Zona Sul'
    if (lat >= -23.58 && lat <= -23.53 && lng >= -46.64 && lng <= -46.62) return 'Tauape'
    return 'Minha região'
  }

  const usarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      setLocalizacaoStatus('Seu navegador não suporta geolocalização.')
      return
    }

    setBuscandoLocalizacao(true)
    setLocalizacaoStatus('Solicitando permissão de localização...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const textoLocalizacao = `Minha localização atual (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
        const novaRegiao = getRegionName(latitude, longitude)

        setLocalizacao({ latitude, longitude })
        setEnderecoCustom(textoLocalizacao)
        setLocalizacaoStatus('Localização obtida. Endereço preenchido automaticamente.')
        setBuscandoLocalizacao(false)
        localStorage.setItem('localizacao', JSON.stringify({ latitude, longitude }))
        localStorage.setItem('regiao', novaRegiao)
        window.dispatchEvent(new Event('localizacao-atualizada'))
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocalizacaoStatus('Permissão de localização negada. Ative no navegador e tente novamente.')
        } else {
          setLocalizacaoStatus('Não foi possível obter a localização. Tente novamente.')
        }
        setBuscandoLocalizacao(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }

  const handleConfirmar = async () => {
    if (!estaLogado) { navigate('/login'); return }
    if (itens.length === 0) return

    const restauranteId = itens[0]?.restauranteId || itens[0]?.loja?.id || null

    setErro('')
    setCarregando(true)
    try {
      const clienteId = usuario?.id
      const itensPedido = itens.map(i => ({
        id: i.cardapioId || i.produtoId || i.id,
        cardapioId: i.cardapioId || i.produtoId || i.id,
        nome: i.name || i.nome,
        quantidade: i.quantidade,
        preco: Number(i.price || i.preco || 0),
      }))

      if (!restauranteId) {
        // Sem restauranteId — pedido local sem backend (modo offline)
        limparCarrinho()
        const numFake = `#${Math.floor(1000 + Math.random() * 9000)}`
        setPedidoConfirmado(numFake)
        return
      }

      const resultado = await api.pedidos.criar({
        clienteId,
        restauranteId,
        itens: itensPedido,
        endereco_entrega: enderecoFinal,
        latitude: localizacao?.latitude || 0,
        longitude: localizacao?.longitude || 0,
        forma_pagamento: pagamentoSelecionado,
        cupom_codigo: cupomAplicado?.codigo || cupom.trim().toUpperCase() || undefined,
        taxa_entrega: taxaEntrega,
        desconto,
      })

      localStorage.removeItem('cupomPromocional')
      limparCarrinho()
      setPedidoConfirmado(`#${String(resultado.id || '').slice(-6) || Math.floor(1000 + Math.random() * 9000)}`)
    } catch (e) {
      setErro('Não foi possível criar o pedido: ' + (e.message || 'Tente novamente'))
    } finally {
      setCarregando(false)
    }
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
        <button onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all border-none">
          Ver restaurantes
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all bg-transparent">
            <ArrowLeft size={16} className="text-text-secondary" />
          </button>
          <h1 className="font-display text-lg font-bold text-text-primary">Finalizar pedido</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Endereço */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Endereço de entrega</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {enderecoPrincipal && (
              <div className="flex items-center gap-3 p-3 bg-primary-light border border-primary/20 rounded-xl">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Endereço salvo</p>
                  <p className="text-sm font-semibold text-text-primary">{enderecoPrincipal}</p>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wide">
                  {enderecoPrincipal ? 'Ou informe outro endereço' : 'Endereço de entrega *'}
                </label>
                <button
                  type="button"
                  onClick={usarLocalizacaoAtual}
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-all"
                >
                  {buscandoLocalizacao ? 'Carregando...' : 'Usar minha localização'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Ex: Rua das Flores, 123 - Apto 4, Bairro"
                value={enderecoCustom}
                onChange={e => setEnderecoCustom(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all"
              />
              {localizacaoStatus && (
                <p className="mt-2 text-xs text-text-muted">{localizacaoStatus}</p>
              )}
            </div>
          </div>
        </Motion.div>

        {/* Pagamento */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CreditCard size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Forma de pagamento</h3>
          </div>
          <div className="p-2">
            {formasPagamento.map(fp => (
              <button key={fp.id} onClick={() => setPagamentoSelecionado(fp.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer border-none ${
                  pagamentoSelecionado === fp.id ? 'bg-primary-light' : 'hover:bg-surface-2'
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  pagamentoSelecionado === fp.id ? 'border-primary' : 'border-border'
                }`}>
                  {pagamentoSelecionado === fp.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  pagamentoSelecionado === fp.id ? 'bg-white text-primary' : 'bg-surface-2 text-text-muted'
                }`}>
                  <fp.Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{fp.label}</p>
                  <p className="text-xs text-text-muted font-semibold">{fp.descricao}</p>
                </div>
              </button>
            ))}
            <AnimatePresence>
              {pagamentoSelecionado === 'pix' && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3 overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl border border-primary/20 bg-primary-light p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <QrPixVisual codigo={codigoPix} imagem={imagemQrPix} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-text-primary">Pix copia e cola</p>
                      <p className="text-xs text-text-muted font-semibold mt-1">Pague {valorTotalFormatado} pelo QR Code. O restaurante recebe a confirmação junto com o pedido.</p>
                      <div className="mt-3 flex items-center gap-2">
                        <code className="flex-1 min-w-0 truncate rounded-xl bg-white border border-border px-3 py-2 text-xs font-bold text-text-secondary">
                          {codigoPix}
                        </code>
                        <button
                          type="button"
                          onClick={() => copiarCodigoPagamento('pix', codigoPix)}
                          className="w-10 h-10 rounded-xl bg-primary text-white border-none flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all"
                          title="Copiar código Pix"
                        >
                          {codigoCopiado === 'pix' ? <CheckCircle size={17} /> : <Copy size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              )}
              {pagamentoSelecionado === 'cartao' && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3 overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl border border-border bg-surface-2 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0">
                      <Bike size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-text-primary">Pagamento na entrega</p>
                      <p className="text-xs text-text-muted font-semibold mt-1">
                        O entregador leva a maquininha para você pagar {valorTotalFormatado} no crédito ou débito quando receber o pedido.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white border border-border px-3 py-1.5 text-xs font-bold text-text-secondary">
                        <ShieldCheck size={14} className="text-accent" />
                        Nenhum dado de cartão fica salvo no app
                      </div>
                    </div>
                  </div>
                </Motion.div>
              )}
              {pagamentoSelecionado === 'dinheiro' && (
                <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-3 pb-3 overflow-hidden">
                  <label className="block text-xs font-bold text-text-muted mb-1.5 mt-2">Troco para quanto? (opcional)</label>
                  <input type="text" placeholder="Ex: R$ 100,00" value={troco} onChange={e => setTroco(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
                </Motion.div>
              )}
              {pagamentoSelecionado === 'boleto' && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3 overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl border border-border bg-surface-2 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0">
                        <ReceiptText size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-text-primary">Boleto do pedido</p>
                        <p className="text-xs text-text-muted font-semibold mt-1">Use a linha digitável para pagar {valorTotalFormatado}. A confirmação pode levar até 1 dia útil.</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <code className="flex-1 min-w-0 truncate rounded-xl bg-white border border-border px-3 py-2 text-xs font-bold text-text-secondary">
                        {linhaBoleto}
                      </code>
                      <button
                        type="button"
                        onClick={() => copiarCodigoPagamento('boleto', linhaBoleto)}
                        className="w-10 h-10 rounded-xl bg-primary text-white border-none flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all"
                        title="Copiar linha digitável"
                      >
                        {codigoCopiado === 'boleto' ? <CheckCircle size={17} /> : <Copy size={17} />}
                      </button>
                    </div>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </Motion.div>

        {/* Cupom */}
        <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Tag size={16} className="text-primary" />
            <h3 className="font-display text-base font-bold text-text-primary">Cupom de desconto</h3>
          </div>
          <div className="p-5">
            {cupomAplicado ? (
              <div className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-accent">🎉 Cupom "{cupomAplicado.codigo}" aplicado!</p>
                  <p className="text-xs text-text-muted font-semibold mt-0.5">{cupomDescricao}</p>
                </div>
                <button onClick={() => { setCupomAplicado(null); setCupom('') }}
                  className="w-7 h-7 rounded-full bg-transparent border border-accent/30 flex items-center justify-center cursor-pointer text-accent hover:bg-accent/20 transition-all">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" placeholder="Digite o código do cupom"
                  value={cupom} onChange={e => { setCupom(e.target.value); setCupomErro('') }}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
                <button onClick={aplicarCupom}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all border-none whitespace-nowrap">
                  Aplicar
                </button>
              </div>
            )}
            {cupomErro && <p className="text-xs text-red-500 font-semibold mt-2">⚠️ {cupomErro}</p>}
          </div>
        </Motion.div>

        {/* Resumo */}
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
                  R$ {((item.price || item.preco || 0) * item.quantidade).toFixed(2).replace('.', ',')}
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
              {desconto > 0 && (
                <div className="flex justify-between text-sm text-accent font-bold">
                  <span>Desconto cupom</span>
                  <span>- R$ {desconto.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-text-primary border-t border-border pt-2 mt-1">
                <span>Total</span>
                <span className="text-accent">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </Motion.div>

        <div className="flex items-center gap-2 text-sm text-text-muted font-semibold bg-white border border-border rounded-xl px-4 py-3">
          <Clock size={15} className="text-primary shrink-0" />
          Tempo estimado: <strong className="text-text-primary">30-40 minutos</strong>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
            ⚠️ {erro}
          </div>
        )}

        <Motion.button onClick={handleConfirmar} disabled={carregando}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 border-none"
          whileTap={{ scale: 0.98 }}>
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
