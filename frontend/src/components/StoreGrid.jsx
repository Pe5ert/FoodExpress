import styled from 'styled-components'
import StoreCard from './StoreCard'
 
const GridContainer = styled.div``
 
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
 
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;
 
const lojas = [
  { id: 1, nome: 'Pizza Hut', categoria: 'Pizza • Italiana', avaliacao: 4.5, tempoEntrega: '30-40 min', taxaEntrega: 'Grátis', emoji: '🍕', promo: '20% OFF' },
  { id: 2, nome: "McDonald's", categoria: 'Lanches • Fast Food', avaliacao: 4.2, tempoEntrega: '20-30 min', taxaEntrega: 'R$ 3,00', emoji: '🍔' },
  { id: 3, nome: 'Sabor da Terra', categoria: 'Brasileira • Marmita', avaliacao: 4.8, tempoEntrega: '35-45 min', taxaEntrega: 'R$ 6,00', emoji: '🥘' },
  { id: 4, nome: 'Sushi Express', categoria: 'Japonesa • Sushi', avaliacao: 4.7, tempoEntrega: '40-50 min', taxaEntrega: 'Grátis', emoji: '🍱', promo: 'Novo' },
  { id: 5, nome: 'Açaí do Norte', categoria: 'Açaí • Vitaminas', avaliacao: 4.6, tempoEntrega: '20-30 min', taxaEntrega: 'R$ 2,00', emoji: '🫐' },
  { id: 6, nome: 'Churrascaria Sul', categoria: 'Churrasco • Carnes', avaliacao: 4.9, tempoEntrega: '45-55 min', taxaEntrega: 'R$ 8,00', emoji: '🥩' },
]
 
const mercados = [
  { id: 7, nome: 'Mercado Perto', categoria: 'Mercado • Hortifruti', avaliacao: 4.3, tempoEntrega: '25-35 min', taxaEntrega: 'R$ 4,00', emoji: '🛒' },
  { id: 8, nome: 'Farmácia 24h', categoria: 'Farmácia • Saúde', avaliacao: 4.5, tempoEntrega: '15-25 min', taxaEntrega: 'Grátis', emoji: '💊', promo: '24h' },
  { id: 9, nome: 'Conveniência Rápida', categoria: 'Bebidas • Snacks', avaliacao: 4.1, tempoEntrega: '10-20 min', taxaEntrega: 'R$ 3,00', emoji: '🏪' },
  { id: 10, nome: 'Hortifruti Verde', categoria: 'Frutas • Legumes', avaliacao: 4.7, tempoEntrega: '30-40 min', taxaEntrega: 'Grátis', emoji: '🥦' },
]
 
export default function StoreGrid({ titulo, tipo }) {
  const lista = tipo === 'mercado' ? mercados : lojas
 
  return (
    <GridContainer>
      <Grid>
        {lista.map((loja, i) => (
          <StoreCard key={loja.id} loja={loja} index={i} />
        ))}
      </Grid>
    </GridContainer>
  )
}