import StoreCard from './CartaoLoja'
import { lojas } from '../data/dadosLojas'

const mercados = [
  { id: 7, nome: 'Mercado Perto', categoria: 'Mercado', avaliacao: 4.3, tempoEntrega: '25-35 min', taxaEntrega: 'R$ 4,00', emoji: '🛒', distancia: '0.5 km' },
  { id: 8, nome: 'Farmácia 24h', categoria: 'Farmácia', avaliacao: 4.5, tempoEntrega: '15-25 min', taxaEntrega: 'Grátis', emoji: '💊', promo: '24h', distancia: '1.1 km' },
  { id: 9, nome: 'Conveniência Rápida', categoria: 'Conveniência', avaliacao: 4.1, tempoEntrega: '10-20 min', taxaEntrega: 'R$ 3,00', emoji: '🏪', distancia: '0.3 km' },
  { id: 10, nome: 'Hortifruti Verde', categoria: 'Hortifruti', avaliacao: 4.7, tempoEntrega: '30-40 min', taxaEntrega: 'Grátis', emoji: '🥦', distancia: '2.0 km' },
]

export default function StoreGrid({ tipo }) {
  const lista = tipo === 'mercado' ? mercados : lojas
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {lista.map((loja, i) => (
        <StoreCard key={loja.id} loja={loja} index={i} />
      ))}
    </div>
  )
}
