import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CartDrawer from './GavetaCarrinho'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { Search, MapPin, ChevronDown, LogIn, ShoppingBag, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../contexts/DarkModeContext'
import logoSrc from '../imgs/Logo-site.png'
import { motion as Motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'

export default function Header() {
  const { estaLogado, usuario, sair } = useAuth()
  const { quantidadeTotal, totalCarrinho } = useCart()
  const { dark, toggle } = useDarkMode()
  const navigate = useNavigate()
  const location = useLocation()
  const [busca, setBusca] = useState('')
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [menuMobile, setMenuMobile] = useState(false)
  const [oculto, setOculto] = useState(false)
  const [ultimoScroll, setUltimoScroll] = useState(0)
  const [popupLocalizacao, setPopupLocalizacao] = useState(false)
  const [modoCep, setModoCep] = useState(false)
  const [cep, setCep] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('cep') || ''
    return ''
  })
  const [dadosCep, setDadosCep] = useState(null)
  const [numeroEndereco, setNumeroEndereco] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('enderecoNumero') || ''
    return ''
  })
  const [complementoEndereco, setComplementoEndereco] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('enderecoComplemento') || ''
    return ''
  })
  const [regiao, setRegiao] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('regiao') || 'Tauape'
    }
    return 'Tauape'
  })
  const [statusLocalizacao, setStatusLocalizacao] = useState('')

  const { scrollY } = useScroll()

  // Esconde ao rolar pra baixo, aparece ao rolar pra cima
  useMotionValueEvent(scrollY, 'change', (atual) => {
    if (atual < 60) {
      setOculto(false)
    } else if (atual > ultimoScroll && atual > 60) {
      setOculto(true)
      setMenuMobile(false)
    } else if (atual < ultimoScroll) {
      setOculto(false)
    }
    setUltimoScroll(atual)
  })

  const logado = estaLogado
  const perfil = usuario?.perfil || null
  const rotaPerfil = perfil === 'gerente' || perfil === 'operador'
    ? '/gerente'
    : perfil === 'entregador'
      ? '/entregador'
      : perfil === 'restaurante'
        ? '/painel-restaurante'
        : '/perfil'
  const total = totalCarrinho || 0
  const qtd = quantidadeTotal || 0
  const ativo = (path) => location.pathname === path

  const getRegionName = (lat, lng) => {
    if (lat >= -23.57 && lat <= -23.53 && lng >= -46.64 && lng <= -46.62) return 'Tauape'
    if (lat >= -23.7 && lat <= -23.45 && lng >= -46.7 && lng <= -46.45) return 'São Paulo'
    if (lat >= -23.65 && lat <= -23.55 && lng >= -46.75 && lng <= -46.6) return 'Zona Sul'
    return 'Sua região'
  }

  const formatarCep = (valor) => {
    const digitos = String(valor || '').replace(/\D/g, '').slice(0, 8)
    if (digitos.length <= 5) return digitos
    return `${digitos.slice(0, 5)}-${digitos.slice(5)}`
  }

  const abrirCepManual = (mensagem = '') => {
    setModoCep(true)
    setPopupLocalizacao(true)
    setStatusLocalizacao(mensagem)
  }

  const montarNomeEndereco = (dadosCep, cepFormatado) => {
    const logradouro = String(dadosCep?.logradouro || '').trim()
    const bairro = String(dadosCep?.bairro || '').trim()
    const cidade = String(dadosCep?.localidade || '').trim()
    const uf = String(dadosCep?.uf || '').trim()

    if (logradouro && bairro) return `${logradouro}, ${bairro}`
    if (logradouro) return logradouro
    if (bairro && cidade) return `${bairro}, ${cidade}`
    if (cidade && uf) return `${cidade}, ${uf}`
    return `CEP ${cepFormatado}`
  }

  const montarEnderecoCompleto = (dados, cepFormatado, numero, complemento) => {
    const logradouro = String(dados?.logradouro || '').trim()
    const bairro = String(dados?.bairro || '').trim()
    const cidade = String(dados?.localidade || '').trim()
    const uf = String(dados?.uf || '').trim()
    const partes = [
      [logradouro || `CEP ${cepFormatado}`, numero].filter(Boolean).join(', '),
      complemento,
      bairro,
      cidade && uf ? `${cidade} - ${uf}` : cidade || uf,
    ].filter(Boolean)
    return partes.join(' · ')
  }

  const salvarCepManual = async (e) => {
    e?.preventDefault()
    const cepFormatado = formatarCep(cep)
    const digitos = cepFormatado.replace(/\D/g, '')

    if (digitos.length !== 8) {
      setStatusLocalizacao('Digite um CEP válido com 8 números.')
      return
    }

    if (dadosCep) {
      if (!numeroEndereco.trim()) {
        setStatusLocalizacao('Informe o número do endereço.')
        return
      }

      const novaRegiao = montarNomeEndereco(dadosCep, cepFormatado)
      const enderecoCompleto = montarEnderecoCompleto(
        dadosCep,
        cepFormatado,
        numeroEndereco.trim(),
        complementoEndereco.trim()
      )

      setRegiao(novaRegiao)
      localStorage.setItem('cep', cepFormatado)
      localStorage.setItem('regiao', novaRegiao)
      localStorage.setItem('enderecoCep', JSON.stringify(dadosCep))
      localStorage.setItem('enderecoNumero', numeroEndereco.trim())
      localStorage.setItem('enderecoComplemento', complementoEndereco.trim())
      localStorage.setItem('enderecoEntrega', enderecoCompleto)
      localStorage.removeItem('localizacao')
      window.dispatchEvent(new Event('localizacao-atualizada'))
      setStatusLocalizacao('Endereço definido.')
      setPopupLocalizacao(false)
      setModoCep(false)
      return
    }

    try {
      setStatusLocalizacao('Buscando endereço pelo CEP...')
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
      const dadosCep = await resposta.json()

      if (!resposta.ok || dadosCep?.erro) {
        setStatusLocalizacao('CEP não encontrado. Confira os números ou consulte nos Correios.')
        return
      }

      const novaRegiao = montarNomeEndereco(dadosCep, cepFormatado)
      setCep(cepFormatado)
      setDadosCep(dadosCep)
      setRegiao(novaRegiao)
      setStatusLocalizacao('Endereço encontrado. Informe número e complemento, se houver.')
    } catch {
      setStatusLocalizacao('Não foi possível consultar o CEP agora. Tente novamente ou consulte nos Correios.')
    }
  }

  const solicitarLocalizacao = () => {
    if (!navigator.geolocation) {
      abrirCepManual('Não foi possível acessar a localização neste navegador. Informe seu CEP.')
      return
    }

    setModoCep(false)
    setStatusLocalizacao('Buscando localização...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const novaRegiao = getRegionName(latitude, longitude)
        setRegiao(novaRegiao)
        localStorage.setItem('regiao', novaRegiao)
        localStorage.setItem('localizacao', JSON.stringify({ latitude, longitude }))
        localStorage.removeItem('cep')
        localStorage.removeItem('enderecoCep')
        localStorage.removeItem('enderecoNumero')
        localStorage.removeItem('enderecoComplemento')
        localStorage.removeItem('enderecoEntrega')
        window.dispatchEvent(new Event('localizacao-atualizada'))
        setStatusLocalizacao('Localização atual definida.')
        setPopupLocalizacao(false)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          abrirCepManual('Permissão de localização negada. Informe seu CEP para continuar.')
        } else {
          abrirCepManual('Não foi possível obter sua localização. Informe seu CEP para continuar.')
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedRegion = localStorage.getItem('regiao')
    if (savedRegion) {
      setRegiao(savedRegion)
    } else if (navigator.geolocation) {
      setPopupLocalizacao(true)
    }

    const handleLocationUpdated = () => {
      const novaRegiao = localStorage.getItem('regiao')
      if (novaRegiao) setRegiao(novaRegiao)
    }

    window.addEventListener('localizacao-atualizada', handleLocationUpdated)
    return () => window.removeEventListener('localizacao-atualizada', handleLocationUpdated)
  }, [])

  const handleBusca = (e) => {
    e.preventDefault()
    if (busca.trim()) navigate(`/busca?q=${encodeURIComponent(busca)}`)
  }

  const handleSair = () => {
    sair()
    setMenuMobile(false)
  }

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/Restaurantes', label: 'Restaurantes' },
    { to: '/Mercados', label: 'Mercados' },
  ]

  return (
    <>
      <Motion.header
        className="bg-white border-b border-border fixed top-0 left-0 right-0 z-50"
        initial={false}
        animate={{ y: oculto ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-3 sm:gap-6">

          <Link to="/" className="shrink-0 rounded-xl p-1.5 hover:bg-surface-2 transition-colors">
            <img src={logoSrc} alt="FoodExpress" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center">
            {navLinks.map(({ to, label }) => {
              const eAtivo = ativo(to)
              return (
                <Link key={label} to={to}
                  className={`px-3 h-[72px] flex items-center text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                    eAtivo ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-primary hover:border-primary'
                  }`}
                >{label}</Link>
              )
            })}
          </nav>

          <form onSubmit={handleBusca}
            className="flex-1 hidden md:flex items-center bg-surface-2 border border-border rounded-full px-4 h-11 gap-2 transition-all focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.08)]"
          >
            <Search size={16} className="text-text-muted shrink-0" />
            <input type="text" placeholder="Busque por item ou loja" value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
            />
          </form>

          <button type="button" onClick={solicitarLocalizacao} className="hidden xl:flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all hover:bg-primary-light shrink-0 cursor-pointer border-none bg-transparent">
            <MapPin size={18} className="text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-[0.68rem] text-text-muted font-semibold leading-none">Próximo de</span>
              <span className="max-w-36 truncate text-sm font-extrabold text-text-primary leading-tight">{regiao}</span>
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button
              onClick={() => setMenuMobile(m => !m)}
              className="lg:hidden w-10 h-10 rounded-full border-none bg-transparent flex items-center justify-center text-text-secondary cursor-pointer hover:bg-primary-light hover:text-primary transition-all"
            >
              {menuMobile ? <X size={20} /> : <Menu size={20} />}
            </button>

            {logado ? (
              <>
                <button onClick={() => navigate(rotaPerfil)}
                  className="hidden sm:flex w-10 h-10 rounded-full border-none bg-transparent items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-primary-light hover:text-primary"
                ><User size={20} /></button>

                <button onClick={() => setCarrinhoAberto(true)}
                  className="flex items-center gap-2 bg-transparent border border-border rounded-full py-2 pr-3 pl-2.5 cursor-pointer transition-all hover:border-primary hover:bg-primary-light"
                >
                  <div className="relative w-5 h-5 flex items-center justify-center text-text-primary">
                    <ShoppingBag size={18} />
                    {qtd > 0 && <span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-3.5 h-3.5 text-[0.55rem] font-extrabold flex items-center justify-center px-px border border-white">{qtd}</span>}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="font-display text-xs font-extrabold text-text-primary leading-none">R$ {total.toFixed(2)}</span>
                    <span className="text-[0.65rem] text-text-muted font-semibold leading-snug">{qtd} {qtd === 1 ? 'item' : 'itens'}</span>
                  </div>
                </button>

                <button onClick={toggle}
                  className="hidden sm:flex w-10 h-10 rounded-full border-none bg-transparent items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-surface-2"
                  title={dark ? 'Modo claro' : 'Modo escuro'}
                >{dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}</button>
                <button onClick={handleSair}
                  className="hidden sm:flex w-10 h-10 rounded-full border-none bg-transparent items-center justify-center text-text-secondary cursor-pointer transition-all hover:bg-red-50 hover:text-red-500"
                ><LogOut size={18} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setCarrinhoAberto(true)}
                  className="flex items-center gap-2 bg-transparent border border-border rounded-full py-2 pr-3 pl-2.5 cursor-pointer transition-all hover:border-primary hover:bg-primary-light"
                >
                  <div className="relative w-5 h-5 flex items-center justify-center text-text-primary">
                    <ShoppingBag size={18} />
                    {qtd > 0 && <span className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full min-w-3.5 h-3.5 text-[0.55rem] font-extrabold flex items-center justify-center px-px border border-white">{qtd}</span>}
                  </div>
                </button>

                <button onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-1.5 bg-transparent border border-border rounded-full px-4 py-2 text-sm font-bold text-text-primary cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary-light whitespace-nowrap"
                ><LogIn size={15} /> Entrar</button>
              </>
            )}
          </div>
        </div>

        {/* Localização popup */}
        <AnimatePresence>
          {popupLocalizacao && (
            <Motion.div
              className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Motion.div
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-border"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <MapPin size={22} className="text-primary" />
                    <div>
                      <h2 className="font-display text-lg font-bold text-text-primary">
                        {modoCep ? 'Informe seu CEP' : 'Compartilhar localização'}
                      </h2>
                      <p className="text-sm text-text-muted">
                        {modoCep
                          ? 'Use seu CEP para ajustar a região de entrega.'
                          : 'Para mostrar restaurantes e mercados perto de você, permita o uso da sua localização.'}
                      </p>
                    </div>
                  </div>
                  {statusLocalizacao && (
                    <p className="text-sm text-text-muted">{statusLocalizacao}</p>
                  )}
                  {modoCep ? (
                    <form onSubmit={salvarCepManual} className="flex flex-col gap-3 pt-2">
                      {dadosCep && (
                        <div className="rounded-2xl border border-primary/20 bg-primary-light px-4 py-3">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-primary mb-1">Endereço encontrado</p>
                          <p className="text-sm font-bold text-text-primary">{montarNomeEndereco(dadosCep, formatarCep(cep))}</p>
                          <p className="text-xs font-semibold text-text-muted">
                            {[dadosCep.localidade, dadosCep.uf].filter(Boolean).join(' - ')}
                          </p>
                        </div>
                      )}
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={cep}
                        onChange={(e) => {
                          setCep(formatarCep(e.target.value))
                          setDadosCep(null)
                        }}
                        placeholder="00000-000"
                        className="w-full h-12 rounded-2xl border border-border bg-white px-4 text-base font-bold text-text-primary outline-none transition-all focus:border-primary"
                      />
                      {dadosCep && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="address-line2"
                            value={numeroEndereco}
                            onChange={(e) => setNumeroEndereco(e.target.value.replace(/[^\dA-Za-z/-]/g, '').slice(0, 12))}
                            placeholder="Número"
                            className="w-full h-12 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-text-primary outline-none transition-all focus:border-primary"
                            required
                          />
                          <input
                            type="text"
                            autoComplete="address-line3"
                            value={complementoEndereco}
                            onChange={(e) => setComplementoEndereco(e.target.value.slice(0, 80))}
                            placeholder="Complemento: apto, bloco, condomínio"
                            className="w-full h-12 rounded-2xl border border-border bg-white px-4 text-sm font-semibold text-text-primary outline-none transition-all focus:border-primary"
                          />
                        </div>
                      )}
                      <a
                        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Não sei meu CEP
                      </a>
                      <button
                        type="submit"
                        className="w-full py-3 bg-primary text-white rounded-2xl font-bold transition-all hover:bg-primary/90"
                      >
                        {dadosCep ? 'Salvar endereço' : 'Buscar endereço'}
                      </button>
                      <button
                        type="button"
                        onClick={solicitarLocalizacao}
                        className="w-full py-3 bg-surface-2 text-text-primary rounded-2xl font-semibold transition-all hover:bg-surface-3"
                      >
                        Tentar localização novamente
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={solicitarLocalizacao}
                        className="w-full py-3 bg-primary text-white rounded-2xl font-bold transition-all hover:bg-primary/90"
                      >
                        Permitir localização
                      </button>
                      <button
                        onClick={() => abrirCepManual('Informe seu CEP para ajustar sua região.')}
                        className="w-full py-3 bg-surface-2 text-text-primary rounded-2xl font-semibold transition-all hover:bg-surface-3"
                      >
                        Informar CEP
                      </button>
                      <button
                        onClick={() => setPopupLocalizacao(false)}
                        className="w-full py-3 bg-white text-text-muted rounded-2xl font-semibold transition-all hover:bg-surface-2"
                      >
                        Não agora
                      </button>
                    </div>
                  )}
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Menu mobile dropdown */}
        <AnimatePresence>
          {menuMobile && (
            <Motion.div
              className="lg:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <form onSubmit={handleBusca} className="flex items-center bg-surface-2 border border-border rounded-full px-4 h-10 gap-2 mb-2 focus-within:border-primary">
                <Search size={15} className="text-text-muted shrink-0" />
                <input type="text" placeholder="Busque por item ou loja" value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal min-w-0"
                />
              </form>

              {navLinks.map(({ to, label }, i) => (
                <Motion.div
                  key={to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.05 }}
                >
                  <Link to={to}
                    onClick={() => setMenuMobile(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${ativo(to) ? 'text-primary bg-primary-light' : 'text-text-secondary hover:text-primary hover:bg-primary-light'}`}
                  >{label}</Link>
                </Motion.div>
              ))}

              <Motion.div
                className="border-t border-border mt-1 pt-2 flex gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              >
                {logado ? (
                  <>
                    <button onClick={() => { navigate(rotaPerfil); setMenuMobile(false) }}
                      className="flex-1 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-bold text-text-primary cursor-pointer hover:bg-primary-light hover:border-primary transition-all flex items-center justify-center gap-1.5"
                    ><User size={16} /> Perfil</button>
                    <button onClick={handleSair}
                      className="flex-1 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-500 cursor-pointer hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
                    ><LogOut size={16} /> Sair</button>
                  </>
                ) : (
                  <button onClick={() => { navigate('/login'); setMenuMobile(false) }}
                    className="flex-1 py-2.5 bg-primary text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
                  ><LogIn size={16} /> Entrar</button>
                )}
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.header>

      {/* Espaçador para compensar o header fixed */}
      <div className="h-[72px]" />

      <CartDrawer isOpen={carrinhoAberto} onClose={() => setCarrinhoAberto(false)} />
    </>
  )
}
