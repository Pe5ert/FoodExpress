import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin, Store, LogIn, Bike } from 'lucide-react'
import { Link } from 'react-router-dom'
import logoSrc from '../imgs/Logo-site.png'
import { motion as Motion } from 'framer-motion'

const redesSociais = [
  { Icone: Instagram, href: '#', rotulo: 'Instagram' },
  { Icone: Facebook,  href: '#', rotulo: 'Facebook'  },
  { Icone: Youtube,   href: '#', rotulo: 'Youtube'   },
  { Icone: Twitter,   href: '#', rotulo: 'Twitter'   },
]

const contatos = [
  { Icone: Mail,   texto: 'suporte@foodexpress.com.br' },
  { Icone: Phone,  texto: '(85) 3000-0000'             },
  { Icone: MapPin, texto: 'Fortaleza, CE'               },
]

const linksClientes = [
  { rotulo: 'Início',       href: '/'             },
  { rotulo: 'Restaurantes', href: '/Restaurantes'  },
  { rotulo: 'Mercados',     href: '/Mercados'      },
  { rotulo: 'Buscar',       href: '/busca'         },
  { rotulo: 'Minha conta',  href: '/perfil'        },
]

const selosSeguranca = ['SSL Seguro', 'LGPD', 'PCI DSS']

export default function Rodape() {
  return (
    <footer className="bg-secondary text-white/75 mt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10">

        {/* Coluna 1 — Marca */}
        <Motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
        >
          <img src={logoSrc} alt="FoodExpress" className="h-16 w-auto mb-4" />
          <p className="text-sm leading-relaxed mb-6 max-w-72 opacity-80">
            Conectamos você aos melhores restaurantes e mercados da sua região.
            Peça online e receba em casa.
          </p>
          <div className="flex gap-3 mb-6">
            {redesSociais.map(({ Icone, href, rotulo }) => {
              const IconComponent = Icone
              return (
                <a key={rotulo} href={href} aria-label={rotulo}
                  className="w-9 h-9 bg-white/8 rounded-xl flex items-center justify-center text-white/60 transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5">
                  <IconComponent size={16} />
                </a>
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            {contatos.map(({ Icone, texto }) => {
              const IconComponent = Icone
              return (
                <div key={texto} className="flex items-center gap-2 text-sm font-semibold">
                  <IconComponent size={14} className="text-primary shrink-0" />
                  {texto}
                </div>
              )
            })}
          </div>
        </Motion.div>

        {/* Coluna 2 — Para clientes */}
        <Motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h4 className="font-display text-xs font-extrabold text-white uppercase tracking-widest mb-5">
            Para clientes
          </h4>
          <ul className="flex flex-col gap-2.5">
            {linksClientes.map(({ rotulo, href }) => (
              <li key={rotulo}>
                <Link to={href}
                  className="text-sm font-semibold text-white/60 transition-all hover:text-white hover:pl-1">
                  {rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </Motion.div>

        {/* Coluna 3 — Área do parceiro */}
        <Motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4 className="font-display text-xs font-extrabold text-white uppercase tracking-widest mb-5">
            Área do parceiro
          </h4>
          <p className="text-sm text-white/50 font-semibold mb-5 leading-relaxed">
            Tem um restaurante ou mercado? Cadastre-se e comece a vender hoje.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/register/store"
              className="flex items-center gap-2.5 bg-primary/90 hover:bg-primary text-white px-4 py-3 rounded-xl text-sm font-extrabold transition-all hover:-translate-y-0.5 w-fit">
              <Store size={15} />
              Cadastrar estabelecimento
            </Link>
            <Link to="/login?parceiro=true"
              className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 px-4 py-3 rounded-xl text-sm font-bold transition-all w-fit">
              <LogIn size={15} />
              Entrar como parceiro
            </Link>
          </div>
        </Motion.div>

        {/* Coluna 4 — Área do entregador */}
        <Motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h4 className="font-display text-xs font-extrabold text-white uppercase tracking-widest mb-5">
            Área do entregador
          </h4>
          <p className="text-sm text-white/50 font-semibold mb-5 leading-relaxed">
            Faça suas entregas com flexibilidade e ganhe no seu ritmo.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login?entregador=true"
              className="flex items-center gap-2.5 bg-accent/80 hover:bg-accent text-white px-4 py-3 rounded-xl text-sm font-extrabold transition-all hover:-translate-y-0.5 w-fit">
              <Bike size={15} />
              Entrar como entregador
            </Link>
          </div>
        </Motion.div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-white/8 max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs font-semibold opacity-40">
          © {new Date().getFullYear()} FoodExpress. Todos os direitos reservados.
        </p>
        <div className="flex gap-2">
          {selosSeguranca.map((selo) => (
            <span key={selo}
              className="bg-white/6 border border-white/10 px-2.5 py-1 rounded-md text-[0.7rem] font-bold text-white/50 tracking-wide">
              {selo}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
