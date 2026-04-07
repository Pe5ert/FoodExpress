import {
  Clock, CheckCircle, XCircle, Truck,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, DollarSign, ShoppingBag, Star,
  TrendingUp, TrendingDown,
} from 'lucide-react'

// Aqui está o backend gelado - estes dados são apenas exemplos para o frontend.
// Substituir por chamadas reais ao backend quando disponível.

export const pedidosGerenteExemplo = [
  { id: '#9045', cliente: 'Carlos M.', telefone: '(85) 99872-1234', itens: ['Pizza G + Refri 1L', 'Coca-Cola 2L'], valor: 47.98, status: 'Preparando', tempo: '5 min', endereco: 'Av. Santos Dumont, 500 - Aldeota' },
  { id: '#9044', cliente: 'Ana S.', telefone: '(85) 98765-4321', itens: ['Pizza 4 Pedaços'], valor: 27.98, status: 'Entregando', tempo: '18 min', endereco: 'Rua Nogueira Acioli, 100 - Meireles' },
  { id: '#9043', cliente: 'João P.', telefone: '(85) 91234-5678', itens: ['Pizza G + Borda + Coca'], valor: 32.98, status: 'Entregue', tempo: '32 min', endereco: 'Av. Beira Mar, 200 - Meireles' },
  { id: '#9042', cliente: 'Maria L.', telefone: '(85) 99999-0000', itens: ['Pizza Portuguesa', 'Suco de Laranja'], valor: 54.80, status: 'Entregue', tempo: '45 min', endereco: 'Rua Barão de Studart, 400 - Aldeota' },
  { id: '#9041', cliente: 'Pedro R.', telefone: '(85) 98888-1111', itens: ['Pizza Margherita'], valor: 39.90, status: 'Cancelado', tempo: '52 min', endereco: 'Av. Pontes Vieira, 800 - Dionísio Torres' },
  { id: '#9040', cliente: 'Fernanda C.', telefone: '(85) 97777-2222', itens: ['Pizza Quatro Queijos', 'Água Mineral'], valor: 52.90, status: 'Entregue', tempo: '1h 05min', endereco: 'Rua Osvaldo Cruz, 50 - Meireles' },
]

export const configStatusPedido = {
  Preparando: { cor: 'text-primary bg-primary-light border-primary/20', icon: Clock, texto: 'Preparando' },
  Entregando: { cor: 'text-secondary bg-secondary/8 border-secondary/20', icon: Truck, texto: 'Entregando' },
  Entregue:   { cor: 'text-accent bg-accent/10 border-accent/20', icon: CheckCircle, texto: 'Entregue' },
  Cancelado:  { cor: 'text-red-500 bg-red-50 border-red-200', icon: XCircle, texto: 'Cancelado' },
}

export const ordemStatusPedido = ['Preparando', 'Entregando', 'Entregue', 'Cancelado']

export const categoriasGerenteExemplo = [
  {
    id: 'destaques', nome: 'Destaques',
    produtos: [
      { id: 101, nome: 'Pizza G + Borda + Refri 1L', preco: 47.98, emoji: '🍕', disponivel: true },
      { id: 102, nome: 'Pizza Grande + Borda Grátis', preco: 24.98, emoji: '🍕', disponivel: true },
    ],
  },
  {
    id: 'tradicionais', nome: 'Pizzas Tradicionais',
    produtos: [
      { id: 301, nome: 'Pizza Margherita', preco: 39.90, emoji: '🍕', disponivel: true },
      { id: 302, nome: 'Pizza Portuguesa', preco: 44.90, emoji: '🍕', disponivel: false },
      { id: 303, nome: 'Pizza Frango c/ Catupiry', preco: 46.90, emoji: '🍗', disponivel: true },
    ],
  },
  {
    id: 'bebidas', nome: 'Bebidas',
    produtos: [
      { id: 401, nome: 'Coca-Cola 2L', preco: 12.00, emoji: '🥤', disponivel: true },
      { id: 402, nome: 'Suco de Laranja 500ml', preco: 9.90, emoji: '🍊', disponivel: true },
    ],
  },
]

export const relatoriosGerenteMensais = [
  { mes: 'Out', faturamento: 8420, pedidos: 214 },
  { mes: 'Nov', faturamento: 11340, pedidos: 287 },
  { mes: 'Dez', faturamento: 15890, pedidos: 398 },
  { mes: 'Jan', faturamento: 9750, pedidos: 245 },
  { mes: 'Fev', faturamento: 12100, pedidos: 306 },
  { mes: 'Mar', faturamento: 14280, pedidos: 361 },
]

export const relatoriosGerenteTopProdutos = [
  { nome: 'Pizza G + Borda + Refri 1L', vendas: 148, receita: 7104.96, emoji: '🍕' },
  { nome: 'Pizza Grande + Borda Grátis', vendas: 122, receita: 3047.56, emoji: '🍕' },
  { nome: 'Pizza G + Borda + Coca-Cola', vendas: 98, receita: 3232.04, emoji: '🥤' },
  { nome: 'Pizza Portuguesa', vendas: 76, receita: 3412.40, emoji: '🍕' },
  { nome: 'Coca-Cola 2L', vendas: 203, receita: 2436.00, emoji: '🥤' },
]

export const relatoriosGerenteCards = [
  { label: 'Faturamento do mês', valor: 'R$ 14.280,00', icon: DollarSign, cor: 'text-accent', bg: 'bg-accent/10', variacao: +18.0, periodo: 'vs mês anterior' },
  { label: 'Pedidos do mês', valor: '361', icon: ShoppingBag, cor: 'text-primary', bg: 'bg-primary-light', variacao: +17.9, periodo: 'vs mês anterior' },
  { label: 'Ticket médio', valor: 'R$ 39,56', icon: TrendingUp, cor: 'text-secondary', bg: 'bg-secondary/8', variacao: +0.1, periodo: 'vs mês anterior' },
  { label: 'Avaliação média', valor: '4.8 ⭐', icon: Star, cor: 'text-yellow-500', bg: 'bg-yellow-50', variacao: +0.1, periodo: 'este mês' },
]

export const dashboardGerenteStats = [
  { label: 'Faturamento hoje', valor: 'R$ 1.284,50', icon: DollarSign, cor: 'text-accent', bg: 'bg-accent/10', variacao: +12.4, periodo: 'vs ontem' },
  { label: 'Pedidos hoje', valor: '34', icon: ShoppingBag, cor: 'text-primary', bg: 'bg-primary-light', variacao: +8.2, periodo: 'vs ontem' },
  { label: 'Ticket médio', valor: 'R$ 37,78', icon: TrendingUp, cor: 'text-secondary', bg: 'bg-secondary/8', variacao: -2.1, periodo: 'vs ontem' },
  { label: 'Avaliação média', valor: '4.8 ⭐', icon: Star, cor: 'text-yellow-500', bg: 'bg-yellow-50', variacao: +0.2, periodo: 'este mês' },
]

export const dashboardGerentePedidosRecentes = [
  { id: '#9045', cliente: 'Carlos M.', itens: 'Pizza G + Refri 1L', valor: 47.98, status: 'Preparando', tempo: '5 min' },
  { id: '#9044', cliente: 'Ana S.', itens: 'Pizza 4 Pedaços', valor: 27.98, status: 'Entregando', tempo: '18 min' },
  { id: '#9043', cliente: 'João P.', itens: 'Pizza G + Borda + Coca', valor: 32.98, status: 'Entregue', tempo: '32 min' },
  { id: '#9042', cliente: 'Maria L.', itens: 'Pizza Portuguesa', valor: 44.90, status: 'Entregue', tempo: '45 min' },
  { id: '#9041', cliente: 'Pedro R.', itens: 'Pizza Margherita', valor: 39.90, status: 'Cancelado', tempo: '52 min' },
]

export const graficoDashboardGerente = [
  { hora: '10h', valor: 120 }, { hora: '11h', valor: 280 }, { hora: '12h', valor: 520 },
  { hora: '13h', valor: 680 }, { hora: '14h', valor: 390 }, { hora: '15h', valor: 240 },
  { hora: '16h', valor: 180 }, { hora: '17h', valor: 310 }, { hora: '18h', valor: 580 },
  { hora: '19h', valor: 760 }, { hora: '20h', valor: 890 }, { hora: '21h', valor: 640 },
]
