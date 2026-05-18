import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { ArrowLeft, Store, DollarSign, Star, AlertTriangle, FileText } from 'lucide-react'

const secoes = [
  {
    icone: Store,
    titulo: '1. Adesão à Plataforma',
    texto: `Ao se cadastrar como restaurante parceiro na FoodExpress, você (pessoa jurídica ou pessoa física com CNPJ) concorda com estes Termos para Parceiros e com nossa Política de Privacidade. O cadastro está sujeito à análise e aprovação pela nossa equipe. Reservamo-nos o direito de recusar ou cancelar parcerias que não atendam aos nossos critérios de qualidade, legalidade e conformidade.`,
  },
  {
    icone: DollarSign,
    titulo: '2. Comissão e Repasses',
    texto: `A FoodExpress cobra uma taxa de comissão de 15% sobre o valor bruto de cada pedido concluído. Os repasses são realizados semanalmente, toda segunda-feira, referentes aos pedidos entregues na semana anterior. Pedidos cancelados, disputados ou com chargeback não são contabilizados para repasse. A FoodExpress pode alterar a taxa de comissão com aviso prévio de 30 dias.`,
  },
  {
    icone: FileText,
    titulo: '3. Cardápio e Informações',
    texto: `É responsabilidade do parceiro manter o cardápio atualizado, com preços corretos, descrições verdadeiras e informações sobre alérgenos. O parceiro garante que os produtos ofertados estão disponíveis e serão entregues conforme descrito. Informações falsas ou enganosas podem resultar em suspensão imediata da conta e medidas legais conforme o Código de Defesa do Consumidor.`,
  },
  {
    icone: Star,
    titulo: '4. Qualidade e Padrões',
    texto: `O parceiro compromete-se a manter padrões mínimos de qualidade: manter avaliação média acima de 3.5 estrelas; cumprir os tempos de preparo informados; embalar os produtos de forma adequada e higiênica; operar dentro das normas sanitárias da ANVISA e vigilância sanitária local; e possuir todos os alvarás e licenças exigidos pela legislação vigente.`,
  },
  {
    icone: AlertTriangle,
    titulo: '5. Disputas e Reclamações',
    texto: `O parceiro concorda em cooperar na resolução de disputas abertas por clientes. A FoodExpress pode, a seu critério, realizar reembolso ao cliente e debitar o valor do próximo repasse do parceiro em casos de: produto não entregue por falha do estabelecimento, produto em desacordo com o pedido, ou evidências de adulteração. O parceiro tem até 48h para contestar uma disputa com evidências.`,
  },
  {
    icone: AlertTriangle,
    titulo: '6. Suspensão e Encerramento',
    texto: `A FoodExpress pode suspender ou encerrar a parceria imediatamente em caso de: violação dos Termos ou da legislação vigente; avaliação média abaixo de 3.0 por mais de 30 dias consecutivos; reclamações graves de saúde ou segurança alimentar; fraude ou tentativa de manipulação do sistema; ou qualquer conduta que comprometa a reputação da plataforma.`,
  },
  {
    icone: DollarSign,
    titulo: '7. Uso da Marca FoodExpress',
    texto: `O parceiro poderá utilizar o logo e a marca FoodExpress exclusivamente para fins de divulgação da parceria, conforme diretrizes fornecidas. É proibido modificar a identidade visual, associar a marca a conteúdos negativos, ou usar a marca após o encerramento da parceria. O parceiro concede à FoodExpress licença para utilizar seu nome e logotipo na plataforma durante a vigência do contrato.`,
  },
  {
    icone: FileText,
    titulo: '8. Dados e Relatórios',
    texto: `A FoodExpress coleta e processa dados de pedidos, avaliações e desempenho do parceiro para fins operacionais e de melhoria do serviço. Os dados agregados podem ser usados em relatórios e análises internas. Dados identificados do parceiro não são compartilhados com terceiros sem consentimento, exceto por exigência legal. O parceiro tem acesso aos seus próprios relatórios de desempenho via painel.`,
  },
]

export default function TermosParceiros() {
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center hover:bg-secondary/10 hover:border-secondary/30 transition-colors"
          >
            <ArrowLeft size={16} className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <Store size={18} className="text-secondary" />
            <h1 className="font-display text-lg font-extrabold text-text-primary">Termos para Parceiros</h1>
          </div>
          <span className="ml-auto text-xs text-text-muted font-semibold">Atualizado em jan/2025</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Intro */}
        <Motion.div
          className="bg-secondary/8 border border-secondary/20 rounded-2xl p-6 mb-8 flex gap-4"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        >
          <Store size={22} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-text-primary mb-1">Para restaurantes e estabelecimentos parceiros</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Estes termos regem a relação comercial entre a FoodExpress e os estabelecimentos cadastrados como parceiros na plataforma. Leia com atenção antes de concluir seu cadastro.
            </p>
          </div>
        </Motion.div>

        {/* Destaque comissão */}
        <Motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {[
            { label: 'Taxa de comissão', valor: '15%', desc: 'sobre cada pedido' },
            { label: 'Repasse', valor: 'Semanal', desc: 'toda segunda-feira' },
            { label: 'Avaliação mínima', valor: '3.5 ★', desc: 'para manter parceria' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-border p-4 text-center shadow-sm">
              <p className="font-display text-xl font-extrabold text-secondary">{item.valor}</p>
              <p className="text-xs font-extrabold text-text-primary mt-0.5">{item.label}</p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
          ))}
        </Motion.div>

        {/* Seções */}
        <div className="flex flex-col gap-6">
          {secoes.map((s, i) => {
            const Icone = s.icone
            return (
              <Motion.div
                key={s.titulo}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icone size={15} className="text-secondary" />
                  </div>
                  <h2 className="font-display text-base font-extrabold text-text-primary">{s.titulo}</h2>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{s.texto}</p>
              </Motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <Motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-text-muted mb-4">
            Dúvidas comerciais:{' '}
            <a href="mailto:vdasilvasouza77@gmail.com" className="text-secondary font-bold hover:underline">
              vdasilvasouza77@gmail.com
            </a>
          </p>
          <Link
            to="/politica-privacidade"
            className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:opacity-80 transition-opacity"
          >
            Ver Política de Privacidade →
          </Link>
        </Motion.div>
      </main>
    </div>
  )
}
