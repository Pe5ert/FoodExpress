import styled from 'styled-components'
import { Star, Clock, Truck } from 'lucide-react'

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .image {
    width: 100%;
    height: 140px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 3rem;
  }

  .content {
    padding: 1rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #FF6B35;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .category {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.75rem;
  }

  .info {
    display: flex;
    gap: 1rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    color: #888;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

export default function StoreCard({ loja }) {
  const lojaPadrao = {
    nome: loja?.nome || 'Restaurante Exemplo',
    categoria: loja?.categoria || 'Pizza • Italiana',
    avaliacao: loja?.avaliacao || 4.5,
    tempoEntrega: loja?.tempoEntrega || '30-40 min',
    taxaEntrega: loja?.taxaEntrega || 'R$ 5,00',
  }

  return (
    <Card>
      <div className="image">🍽️</div>
      <div className="content">
        <div className="header">
          <h3>{lojaPadrao.nome}</h3>
          <div className="rating">
            <Star size={14} fill="#FF6B35" />
            {lojaPadrao.avaliacao}
          </div>
        </div>
        <p className="category">{lojaPadrao.categoria}</p>
        <div className="info">
          <div className="info-item">
            <Clock size={14} />
            {lojaPadrao.tempoEntrega}
          </div>
          <div className="info-item">
            <Truck size={14} />
            {lojaPadrao.taxaEntrega}
          </div>
        </div>
      </div>
    </Card>
  )
}

