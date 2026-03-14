
import styled from 'styled-components'
import { Truck, Tag, ArrowRight } from 'lucide-react'
import { useState } from 'react'
 
const BannerWrapper = styled.div`
  margin-top: 2rem;
  overflow: hidden;
`;
 
const BannerTrack = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  margin: 0 -1.5rem;
  padding: 0.5rem 1.5rem;
`;
 
const Banner = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 480px;
  min-width: 280px;
  border-radius: var(--radius-lg);
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: ${props => props.$bg};
  position: relative;
  overflow: hidden;
 
  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -10%;
    width: 180px;
    height: 180px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    pointer-events: none;
  }
 
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;
 
const BannerContent = styled.div`
  color: white;
  flex: 1;
 
  .eyebrow {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 0.35rem;
  }
 
  h3 {
    font-family: 'Sora', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    line-height: 1.1;
  }
 
  p {
    font-size: 0.85rem;
    opacity: 0.85;
    font-weight: 600;
    margin-bottom: 0.9rem;
  }
`;
 
const BannerBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  transition: background 0.2s;
  border: 1px solid rgba(255,255,255,0.25);
 
  &:hover { background: rgba(255,255,255,0.3); }
`;
 
const BannerIcon = styled.div`
  font-size: 3.5rem;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.9;
`;
 
const banners = [
  {
    eyebrow: 'Promoção',
    title: 'Frete Grátis',
    desc: 'Na primeira compra acima de R$ 50',
    icon: '🚀',
    bg: 'linear-gradient(135deg, #FF6B35, #e55a2b)',
  },
  {
    eyebrow: 'Oferta do dia',
    title: '30% OFF',
    desc: 'Em restaurantes selecionados hoje',
    icon: '🎉',
    bg: 'linear-gradient(135deg, #1B998B, #14756a)',
  },
  {
    eyebrow: 'Novo',
    title: 'Mercados Open',
    desc: 'Hortifruti e bebidas em até 20min',
    icon: '🛒',
    bg: 'linear-gradient(135deg, #2E294E, #1a1640)',
  },
]
 
export default function PromotionalBanner() {
  return (
    <BannerWrapper>
      <BannerTrack>
        {banners.map((b, i) => (
          <Banner key={i} $bg={b.bg}>
            <BannerContent>
              <div className="eyebrow">{b.eyebrow}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
              <BannerBtn>Ver oferta <ArrowRight size={13} /></BannerBtn>
            </BannerContent>
            <BannerIcon>{b.icon}</BannerIcon>
          </Banner>
        ))}
      </BannerTrack>
    </BannerWrapper>
  )
}