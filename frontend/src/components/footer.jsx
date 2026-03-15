import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import logoSrc from '../imgs/Logo-site.png'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/75 mt-16">
      <div className="max-w-320 mx-auto px-8 pt-14 pb-10 grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:grid-cols-2 md:grid-cols-1 md:gap-8 md:px-5">

        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logoSrc} alt="FoodExpress" className="h-10 w-auto brightness-0 invert" />
          </div>
          <p className="text-[0.875rem] leading-relaxed mb-6 max-w-70 opacity-80">Conectamos você aos melhores restaurantes e mercados da sua região. Peça online e receba em casa.</p>
          <div className="flex gap-3 mb-6">
            {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 bg-white/8 rounded-xl flex items-center justify-center text-white/60 transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5">
                <Icon size={16} />
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {[
              { Icon: Mail, text: 'suporte@foodexpress.com.br' },
              { Icon: Phone, text: '(11) 3000-0000' },
              { Icon: MapPin, text: 'São Paulo, SP' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[0.82rem] font-semibold">
                <Icon size={14} className="text-primary flex-shrink-0" />{text}
              </div>
            ))}
          </div>
        </div>

        {[
          { titulo: 'Para clientes', links: ['Como funciona', 'Rastrear pedido', 'Meus pedidos', 'Promoções', 'FoodExpress Pass'] },
          { titulo: 'Para parceiros', links: ['Cadastrar loja', 'Portal do parceiro', 'Seja entregador', 'Suporte parceiro'] },
          { titulo: 'Empresa', links: ['Sobre nós', 'Carreiras', 'Imprensa', 'Blog', 'Termos de uso', 'Privacidade'] },
        ].map(({ titulo, links }) => (
          <div key={titulo}>
            <h4 className="font-['Sora'] text-[0.82rem] font-extrabold text-white uppercase tracking-widest mb-5">{titulo}</h4>
            <ul className="flex flex-col gap-2.5">
              {links.map(l => (
                <li key={l}><a href="#" className="text-[0.875rem] font-semibold text-white/60 transition-all hover:text-white hover:pl-1">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/8 max-w-320 mx-auto px-8 py-5 flex items-center justify-between flex-wrap gap-4 md:px-5">
        <p className="text-[0.82rem] font-semibold opacity-40">© 2026 FoodExpress. Todos os direitos reservados.</p>
        <div className="flex gap-2">
          {['SSL Seguro', 'LGPD', 'PCI DSS'].map(b => (
            <span key={b} className="bg-white/6 border border-white/10 px-2.5 py-1 rounded-md text-[0.72rem] font-bold text-white/50 tracking-wide">{b}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
