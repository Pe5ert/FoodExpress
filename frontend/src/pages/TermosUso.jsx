import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { ArrowLeft, Shield, FileText } from 'lucide-react'

const secoes = [
  {
    titulo: '1. Aceitação dos Termos',
    texto: `Ao se cadastrar e utilizar a plataforma FoodExpress, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, solicitamos que não utilize nossos serviços. O uso contínuo da plataforma após alterações nos Termos constitui aceitação das modificações.`,
  },
  {
    titulo: '2. Descrição do Serviço',
    texto: `A FoodExpress é uma plataforma de intermediação entre clientes, restaurantes parceiros e entregadores. Não somos responsáveis pela qualidade dos alimentos, pelo preparo ou pela entrega dos pedidos — esses serviços são prestados exclusivamente pelos parceiros cadastrados. Atuamos como facilitadores da conexão entre as partes.`,
  },
  {
    titulo: '3. Cadastro e Conta',
    texto: `Para utilizar os serviços, você deve fornecer informações verdadeiras, completas e atualizadas no momento do cadastro. Você é o único responsável pela segurança de sua senha e por todas as atividades realizadas em sua conta. Em caso de uso não autorizado, notifique-nos imediatamente pelo suporte. Reservamo-nos o direito de suspender ou encerrar contas com informações falsas ou que violem estes Termos.`,
  },
  {
    titulo: '4. Uso Aceitável',
    texto: `Você concorda em não utilizar a plataforma para fins ilegais, fraudulentos ou prejudiciais a terceiros. É proibido: fazer pedidos com intenção de não pagamento; fornecer endereços falsos; assediar entregadores ou atendentes; tentar burlar o sistema de avaliações; realizar engenharia reversa da plataforma; ou qualquer ação que comprometa a segurança e integridade do serviço.`,
  },
  {
    titulo: '5. Pedidos e Pagamentos',
    texto: `Ao confirmar um pedido, você celebra um contrato de compra diretamente com o restaurante parceiro. O pagamento é processado de forma segura via Stripe. Após confirmação do pedido, o cancelamento pode estar sujeito a multa de até 50% do valor, conforme política do restaurante. Pedidos cancelados após início do preparo não são reembolsados.`,
  },
  {
    titulo: '6. Avaliações',
    texto: `As avaliações devem refletir experiências reais e verídicas. É proibido publicar avaliações falsas, ofensivas, discriminatórias ou que violem direitos de terceiros. A FoodExpress se reserva o direito de remover avaliações que violem estas diretrizes e de suspender usuários que façam uso abusivo do sistema de avaliações.`,
  },
  {
    titulo: '7. Propriedade Intelectual',
    texto: `Todos os conteúdos da plataforma — logotipo, design, código, textos e imagens — são de propriedade exclusiva da FoodExpress ou licenciados para uso. É vedada a reprodução, distribuição ou uso comercial sem autorização expressa. As marcas dos restaurantes parceiros pertencem aos seus respectivos titulares.`,
  },
  {
    titulo: '8. Limitação de Responsabilidade',
    texto: `A FoodExpress não se responsabiliza por danos decorrentes de: falhas nos alimentos fornecidos pelos restaurantes parceiros; atrasos na entrega por fatores externos (trânsito, clima, etc.); uso indevido da plataforma por terceiros; ou indisponibilidade temporária do serviço por manutenção ou problemas técnicos.`,
  },
  {
    titulo: '9. Alterações nos Termos',
    texto: `Podemos modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações relevantes por e-mail ou notificação no aplicativo com pelo menos 15 dias de antecedência. O uso continuado após a data de vigência das alterações implica aceitação dos novos termos.`,
  },
  {
    titulo: '10. Foro e Legislação',
    texto: `Estes Termos são regidos pela legislação brasileira, especialmente o Código de Defesa do Consumidor (Lei 8.078/90), o Marco Civil da Internet (Lei 12.965/14) e a Lei Geral de Proteção de Dados (Lei 13.709/18). Fica eleito o foro da comarca de Fortaleza/CE para dirimir quaisquer controvérsias.`,
  },
]

export default function TermosUso() {
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center hover:bg-primary-light hover:border-primary/30 transition-colors"
          >
            <ArrowLeft size={16} className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <h1 className="font-display text-lg font-extrabold text-text-primary">Termos de Uso</h1>
          </div>
          <span className="ml-auto text-xs text-text-muted font-semibold">Atualizado em jan/2025</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Intro */}
        <Motion.div
          className="bg-primary-light border border-primary/20 rounded-2xl p-6 mb-8 flex gap-4"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        >
          <Shield size={22} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-text-primary mb-1">Leia com atenção</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Estes Termos de Uso regulam a relação entre você e a FoodExpress. Ao usar nossa plataforma, você confirma que leu, entendeu e concorda com todas as condições abaixo.
            </p>
          </div>
        </Motion.div>

        {/* Seções */}
        <div className="flex flex-col gap-6">
          {secoes.map((s, i) => (
            <Motion.div
              key={s.titulo}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <h2 className="font-display text-base font-extrabold text-text-primary mb-3">{s.titulo}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{s.texto}</p>
            </Motion.div>
          ))}
        </div>

        {/* Footer */}
        <Motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-text-muted mb-4">
            Dúvidas? Entre em contato:{' '}
            <a href="mailto:vdasilvasouza77@gmail.com" className="text-primary font-bold hover:underline">
              vdasilvasouza77@gmail.com
            </a>
          </p>
          <Link
            to="/politica-privacidade"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Ver Política de Privacidade →
          </Link>
        </Motion.div>
      </main>
    </div>
  )
}
