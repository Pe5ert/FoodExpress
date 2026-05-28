import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Bike, UtensilsCrossed, BarChart3, ArrowRight } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

const roles = [
  { id: 'cliente',     nome: 'Cliente',      descricao: 'Faça pedidos e acompanhe suas entregas',      Icon: User,            rota: '/' },
  { id: 'entregador',  nome: 'Entregador',   descricao: 'Aceite e realize entregas pela plataforma',   Icon: Bike,            rota: '/entregador' },
  { id: 'restaurante', nome: 'Restaurante',  descricao: 'Gerencie seu cardápio e pedidos recebidos',   Icon: UtensilsCrossed, rota: '/painel-restaurante' },
  { id: 'gerente',     nome: 'Gerente',      descricao: 'Gerencie pedidos, cardápio e relatórios',     Icon: BarChart3,       rota: '/gerente' },
]

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function SelecionarPerfil() {
  const navigate = useNavigate()
  const [selecionado, setSelecionado] = useState('')
  const [carregando, setCarregando] = useState(false)

  const roleSelecionada = roles.find(r => r.id === selecionado)

  const continuar = async () => {
    if (!roleSelecionada) return
    setCarregando(true)
    if (selecionado === 'cliente') {
      navigate('/')
      return
    }
    if (selecionado === 'restaurante') {
      navigate('/register/store')
      return
    }
    if (selecionado === 'entregador') {
      navigate('/register/entregador')
      return
    }
    if (selecionado === 'gerente') {
      navigate('/login?parceiro=true')
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <img src={logoSrc} alt="FoodExpress" className="h-10 mx-auto mb-3" />
        <p className="text-white/70 font-semibold text-sm">
          Como você vai usar a plataforma?
        </p>
      </Motion.div>

      {/* Cards de role */}
      <Motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-8"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
      >
        {roles.map(({ id, nome, descricao, Icon }) => {
          const ativo = selecionado === id
          return (
            <Motion.button
              key={id}
              variants={itemVariants}
              onClick={() => setSelecionado(id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-2xl p-6 text-left border-2 transition-all duration-200 ${
                ativo
                  ? 'bg-primary border-primary shadow-xl shadow-primary/30'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                ativo ? 'bg-white/20' : 'bg-white/10'
              }`}>
                <Icon size={20} className={ativo ? 'text-white' : 'text-white/70'} />
              </div>
              <h3 className={`font-display font-extrabold text-base mb-1 ${ativo ? 'text-white' : 'text-white/90'}`}>
                {nome}
              </h3>
              <p className={`text-xs font-semibold leading-relaxed ${ativo ? 'text-white/80' : 'text-white/50'}`}>
                {descricao}
              </p>
            </Motion.button>
          )
        })}
      </Motion.div>

      {/* Botão continuar */}
      <Motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={continuar}
        disabled={!selecionado || carregando}
        whileHover={selecionado ? { scale: 1.03 } : {}}
        whileTap={selecionado ? { scale: 0.97 } : {}}
        className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all ${
          selecionado && !carregando
            ? 'bg-white text-secondary cursor-pointer shadow-lg'
            : 'bg-white/20 text-white/40 cursor-not-allowed'
        }`}
      >
        {carregando
          ? 'Carregando...'
          : `Continuar como ${roleSelecionada?.nome ?? '...'}`}
        {!carregando && selecionado && <ArrowRight size={16} />}
      </Motion.button>
    </div>
  )
}
