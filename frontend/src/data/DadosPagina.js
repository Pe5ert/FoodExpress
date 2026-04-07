import {
  QrCode, CreditCard, Banknote, CheckCircle, Package, Truck,
  MapPin, DollarSign, Bike, Star, User, Mail, Phone,
} from 'lucide-react'

// aqui é o back gelado - dados de exemplo para páginas do frontend.
// Substituir por chamadas reais ao backend/API quando disponível.

export const filtrosBusca = ['Entrega Grátis', 'Super Restaurante', 'Mais Avaliados', 'Mais Próximos']

export const pedidosClienteExemplo = [
  { id: '#8821', loja: 'Pizza Hut', emoji: '🍕', itens: 'Pizza G + Borda + Refri', total: 47.98, status: 'Entregue', data: 'Hoje, 19:32', avaliacao: 5 },
  { id: '#8814', loja: "McDonald's", emoji: '🍔', itens: 'Big Mac + McFries', total: 38.90, status: 'Entregue', data: 'Ontem, 13:10', avaliacao: 4 },
  { id: '#8801', loja: 'Sushi Express', emoji: '🍱', itens: 'Combo Sushi 20 peças', total: 89.90, status: 'Entregue', data: '10 mar, 20:45', avaliacao: null },
]

export const enderecosClienteExemplo = [
  { id: 1, label: 'Casa', rua: 'Av. Principal, 123', bairro: 'Aldeota', cidade: 'Fortaleza - CE', principal: true },
  { id: 2, label: 'Trabalho', rua: 'Rua do Comércio, 500', bairro: 'Centro', cidade: 'Fortaleza - CE', principal: false },
]

export const checkoutFormasPagamento = [
  { id: 'pix', label: 'Pix', icone: QrCode, descricao: 'Aprovação imediata' },
  { id: 'credito', label: 'Cartão de Crédito', icone: CreditCard, descricao: 'Até 12x sem juros' },
  { id: 'debito', label: 'Cartão de Débito', icone: CreditCard, descricao: 'Débito na hora' },
  { id: 'dinheiro', label: 'Dinheiro', icone: Banknote, descricao: 'Pague na entrega' },
]

export const enderecosCheckoutExemplo = [
  { id: 1, label: 'Casa', rua: 'Av. Principal, 123', bairro: 'Aldeota', cidade: 'Fortaleza - CE' },
  { id: 2, label: 'Trabalho', rua: 'Rua do Comércio, 500', bairro: 'Centro', cidade: 'Fortaleza - CE' },
]

export const etapasCheckoutExemplo = [
  { icone: CheckCircle, label: 'Pedido confirmado', concluido: true },
  { icone: Package, label: 'Preparando seu pedido', concluido: true },
  { icone: Truck, label: 'Saiu para entrega', concluido: false },
  { icone: MapPin, label: 'Entregue', concluido: false },
]

export const entregaAtivaEntregadorExemplo = {
  id: '#9051',
  cliente: { nome: 'Lucas Ferreira', telefone: '(85) 99872-4431', avatar: 'LF' },
  loja: { nome: 'Pizza Hut', emoji: '🍕', endereco: 'Av. Pontes Vieira, 726 - Tauape' },
  destino: { rua: 'Av. Santos Dumont, 1901', bairro: 'Aldeota', cidade: 'Fortaleza - CE' },
  itens: 'Pizza G + Borda + Refri 1L',
  valor: 47.98,
  distancia: '2,4 km',
  tempoEstimado: '12 min',
  etapa: 'coletando',
}

export const filaEntregadorExemplo = [
  { id: '#9052', loja: 'McDonald\'s', emoji: '🍔', destino: 'Av. Beira Mar, 100', valor: 38.90, distancia: '1,8 km' },
  { id: '#9053', loja: 'Sushi Express', emoji: '🍱', destino: 'Rua Nogueira Acioli, 50', valor: 89.90, distancia: '3,2 km' },
]

export const historicoEntregadorExemplo = [
  { id: '#9050', loja: 'Açaí do Norte', emoji: '🫐', cliente: 'Ana S.', valor: 27.50, tempo: '08 min', avaliacao: 5, horario: '19:12' },
  { id: '#9049', loja: 'Sabor da Terra', emoji: '🥘', cliente: 'Pedro R.', valor: 44.90, tempo: '14 min', avaliacao: 4, horario: '18:45' },
  { id: '#9048', loja: 'Pizza Hut', emoji: '🍕', cliente: 'Maria L.', valor: 32.98, tempo: '11 min', avaliacao: 5, horario: '18:10' },
  { id: '#9047', loja: 'McDonald\'s', emoji: '🍔', cliente: 'João P.', valor: 21.90, tempo: '09 min', avaliacao: 5, horario: '17:42' },
]

export const estatisticasEntregadorExemplo = [
  { label: 'Ganhos hoje', valor: 'R$ 87,40', icon: DollarSign, cor: 'text-accent', bg: 'bg-accent/10', variacao: '+R$ 12,50 vs ontem' },
  { label: 'Entregas', valor: '11', icon: Package, cor: 'text-primary', bg: 'bg-primary-light', variacao: '+3 vs ontem' },
  { label: 'Km rodados', valor: '28,4', icon: Bike, cor: 'text-secondary', bg: 'bg-secondary/10', variacao: 'km hoje' },
  { label: 'Avaliação', valor: '4.9 ⭐', icon: Star, cor: 'text-yellow-500', bg: 'bg-yellow-50', variacao: 'últimas 50' },
]

export const camposCadastroUsuario = [
  { label: 'Nome completo', name: 'nome', type: 'text', placeholder: 'Seu nome completo', Icon: User },
  { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com', Icon: Mail },
  { label: 'Telefone / WhatsApp', name: 'telefone', type: 'tel', placeholder: '(11) 99999-9999', Icon: Phone },
]

export const beneficiosCadastroUsuario = [
  'Peça em centenas de restaurantes',
  'Acompanhe seu pedido em tempo real',
  'Pagamento rápido e seguro',
  'Ofertas exclusivas para membros',
]

export const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
export const formasPagamentoOpcoes = ['Dinheiro', 'Crédito', 'Débito', 'Pix', 'Vale Refeição']

export const tiposCadastroEstabelecimento = [
  { value: 'restaurante', label: '🍽️ Restaurante' },
  { value: 'pizzaria', label: '🍕 Pizzaria' },
  { value: 'lanchonete', label: '🍔 Lanchonete' },
  { value: 'mercado', label: '🛒 Mercado' },
  { value: 'farmacia', label: '💊 Farmácia' },
  { value: 'padaria', label: '🥖 Padaria' },
  { value: 'outros', label: '📦 Outros' },
]
