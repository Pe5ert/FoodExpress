import styled from 'styled-components'
import { Star, Clock, Truck, Heart } from 'lucide-react'
import { useState } from 'react'
 
const Card = styled.div`
  background: var(--surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
 
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: transparent;
  }
`;
 
const ImageBox = styled.div`
  position: relative;
  width: 100%;
  height: 155px;
  background: ${props => props.$bg || 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  overflow: hidden;
 
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 100%);
  }
`;
 
const ClosedBadge = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
 
  span {
    background: white;
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 800;
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius-full);
    letter-spacing: 0.5px;
  }
`;
 
const FavBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  color: ${props => props.$active ? '#FF4444' : '#ccc'};
 
  &:hover {
    transform: scale(1.1);
    color: #FF4444;
  }
`;
 
const PromoTag = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  background: var(--primary);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xs);
  letter-spacing: 0.3px;
`;
 
const Body = styled.div`
  padding: 0.85rem 1rem 1rem;
`;
 
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.3rem;
  gap: 0.5rem;
`;
 
const StoreName = styled.h3`
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  flex: 1;
`;
 
const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  flex-shrink: 0;
`;
 
const Category = styled.p`
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.75rem;
`;
 
const Divider = styled.div`
  height: 1px;
  background: var(--border);
  margin-bottom: 0.75rem;
`;
 
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
 
const InfoChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
 
  svg { color: var(--accent); flex-shrink: 0; }
`;
 
const FreeTag = styled.span`
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 800;
  margin-left: auto;
`;
 
const gradients = [
  'linear-gradient(135deg, #FFE0D0 0%, #FFCAB4 100%)',
  'linear-gradient(135deg, #D0F0EE 0%, #B4E8E4 100%)',
  'linear-gradient(135deg, #E0EAFF 0%, #C8D8FF 100%)',
  'linear-gradient(135deg, #FFF0D0 0%, #FFE4AA 100%)',
  'linear-gradient(135deg, #F0D0FF 0%, #E4AAFF 100%)',
]
 
export default function StoreCard({ loja, index = 0 }) {
  const [fav, setFav] = useState(false)
 
  const store = {
    nome: loja?.nome || 'Restaurante Exemplo',
    categoria: loja?.categoria || 'Pizza • Italiana',
    avaliacao: loja?.avaliacao || 4.5,
    tempoEntrega: loja?.tempoEntrega || '30-40 min',
    taxaEntrega: loja?.taxaEntrega || 'R$ 5,00',
    emoji: loja?.emoji || '🍽️',
    promo: loja?.promo || null,
    fechado: loja?.fechado || false,
    gratis: loja?.taxaEntrega === 'Grátis' || loja?.gratis,
  }
 
  return (
    <Card>
      <ImageBox $bg={gradients[index % gradients.length]}>
        {store.emoji}
        {store.fechado && <ClosedBadge><span>FECHADO</span></ClosedBadge>}
        {store.promo && <PromoTag>{store.promo}</PromoTag>}
        <FavBtn $active={fav} onClick={(e) => { e.stopPropagation(); setFav(f => !f); }}>
          <Heart size={15} fill={fav ? '#FF4444' : 'none'} />
        </FavBtn>
      </ImageBox>
 
      <Body>
        <TopRow>
          <StoreName>{store.nome}</StoreName>
          <RatingBadge>
            <Star size={13} fill="#FFBA08" stroke="#FFBA08" />
            {store.avaliacao}
          </RatingBadge>
        </TopRow>
        <Category>{store.categoria}</Category>
        <Divider />
        <InfoRow>
          <InfoChip><Clock size={13} />{store.tempoEntrega}</InfoChip>
          <InfoChip>
            <Truck size={13} />
            {store.gratis ? <FreeTag>Grátis</FreeTag> : store.taxaEntrega}
          </InfoChip>
        </InfoRow>
      </Body>
    </Card>
  )
}