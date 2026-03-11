import styled from 'styled-components'
import StoreCard from './StoreCard'

const GridContainer = styled.div`
  padding: 1rem;
`;

const Title = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const lojasExemplo = [
  { id: 1, nome: 'Pizza Hut', categoria: 'Pizza • Italiana', avaliacao: 4.5, tempoEntrega: '30-40 min', taxaEntrega: 'R$ 5,00' },
  { id: 2, nome: "McDonald's", categoria: 'Lanches • Fast Food', avaliacao: 4.2, tempoEntrega: '20-30 min', taxaEntrega: 'R$ 3,00' },
  { id: 3, nome: 'Restaurante Sabor', categoria: 'Brasileira', avaliacao: 4.8, tempoEntrega: '35-45 min', taxaEntrega: 'R$ 6,00' },
  { id: 4, nome: 'Sushi Express', categoria: 'Japonesa • Sushi', avaliacao: 4.7, tempoEntrega: '40-50 min', taxaEntrega: 'R$ 8,00' },
]

export default function StoreGrid({ titulo = 'Restaurantes Próximos' }) {
  return (
    <GridContainer>
      <Title>{titulo}</Title>
      <Grid>
        {lojasExemplo.map(loja => (
          <StoreCard key={loja.id} loja={loja} />
        ))}
      </Grid>
    </GridContainer>
  )
}

