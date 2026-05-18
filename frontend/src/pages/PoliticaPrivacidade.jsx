import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { ArrowLeft, Lock, Eye, Database, UserCheck, Trash2, Mail } from 'lucide-react'

const secoes = [
  {
    icone: Database,
    titulo: '1. Quais dados coletamos',
    texto: `Coletamos apenas os dados necessários para a prestação dos serviços: dados de identificação (nome, e-mail, CPF/CNPJ, telefone), dados de localização para cálculo de frete e rastreamento de pedidos, dados de pagamento processados com segurança pela Stripe (não armazenamos dados de cartão), histórico de pedidos e avaliações, e dados de uso da plataforma para melhoria do serviço.`,
  },
  {
    icone: Eye,
    titulo: '2. Como usamos seus dados',
    texto: `Seus dados são utilizados exclusivamente para: processar e entregar seus pedidos; calcular rotas e taxas de entrega; enviar notificações sobre o status do pedido; melhorar nossos serviços com base no comportamento de uso; cumprir obrigações legais e fiscais; e prevenir fraudes e garantir a segurança da plataforma. Não utilizamos seus dados para publicidade de terceiros.`,
  },
  {
    icone: UserCheck,
    titulo: '3. Compartilhamento de dados',
    texto: `Compartilhamos seus dados apenas nas seguintes situações: com o restaurante parceiro para processamento do pedido (nome e endereço de entrega); com o entregador para realização da entrega (nome e localização de entrega); com a Stripe para processamento seguro do pagamento; e com autoridades públicas quando exigido por lei. Nunca vendemos seus dados a terceiros.`,
  },
  {
    icone: Lock,
    titulo: '4. Segurança dos dados',
    texto: `Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia TLS em todas as comunicações; armazenamento seguro em banco de dados com controle de acesso; autenticação por token JWT com expiração; monitoramento de atividades suspeitas; e política de acesso mínimo necessário para colaboradores. Em caso de incidente de segurança, notificaremos os usuários afetados conforme previsto na LGPD.`,
  },
  {
    icone: UserCheck,
    titulo: '5. Seus direitos (LGPD)',
    texto: `Conforme a Lei Geral de Proteção de Dados (Lei 13.709/18), você tem direito a: confirmar a existência de tratamento de dados; acessar seus dados; corrigir dados incompletos ou desatualizados; solicitar anonimização, bloqueio ou eliminação de dados desnecessários; solicitar portabilidade dos dados; revogar o consentimento a qualquer momento; e ser informado sobre o uso compartilhado dos seus dados.`,
  },
  {
    icone: Trash2,
    titulo: '6. Retenção e exclusão',
    texto: `Mantemos seus dados pelo tempo necessário para a prestação dos serviços e cumprimento de obrigações legais. Dados de pedidos são mantidos por 5 anos conforme exigência fiscal. Após o encerramento da conta, dados pessoais são anonimizados ou excluídos em até 30 dias, exceto quando houver obrigação legal de retenção. Você pode solicitar a exclusão da sua conta a qualquer momento pelo suporte.`,
  },
  {
    icone: Database,
    titulo: '7. Cookies e rastreamento',
    texto: `Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação, preferências) e cookies analíticos para entender como os usuários interagem com o serviço. Não utilizamos cookies de publicidade ou rastreamento de terceiros. Você pode gerenciar as preferências de cookies nas configurações do seu navegador, mas desabilitar cookies essenciais pode afetar o funcionamento da plataforma.`,
  },
  {
    icone: Mail,
    titulo: '8. Contato e DPO',
    texto: `Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO): vdasilvasouza77@gmail.com. Responderemos em até 15 dias úteis. Para reclamações não resolvidas, você pode acionar a Autoridade Nacional de Proteção de Dados (ANPD) em gov.br/anpd.`,
  },
]

export default function PoliticaPrivacidade() {
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
            <Lock size={18} className="text-primary" />
            <h1 className="font-display text-lg font-extrabold text-text-primary">Política de Privacidade</h1>
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
          <Lock size={22} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-text-primary mb-1">Sua privacidade é prioridade</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/18).
            </p>
          </div>
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
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <Icone size={15} className="text-primary" />
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
            DPO:{' '}
            <a href="mailto:vdasilvasouza77@gmail.com" className="text-primary font-bold hover:underline">
              vdasilvasouza77@gmail.com
            </a>
          </p>
          <Link
            to="/termos-uso"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Ver Termos de Uso →
          </Link>
        </Motion.div>
      </main>
    </div>
  )
}
