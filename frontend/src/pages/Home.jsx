
import styled from 'styled-components'
import Header from '../components/Header'
import CategoriesCarousel from '../components/CategoriesCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'
import { Search, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 
const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--background);
  padding-bottom: 80px;
`
 
const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--secondary) 0%, #1a1640 50%, var(--secondary-light) 100%);
  padding: 3.5rem 1.5rem 5rem;
  position: relative;
  overflow: hidden;
 
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
 
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 40px;
    background: var(--background);
    clip-path: ellipse(55% 100% at 50% 100%);
  }
`;
 
const HeroInner = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;
 
const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,107,53,0.2);
  border: 1px solid rgba(255,107,53,0.3);
  color: #FFB8A0;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  letter-spacing: 0.3px;
`;
 
const HeroTitle = styled.h1`
  font-family: 'Sora', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
  line-height: 1.1;
  letter-spacing: -1px;
 
  span { color: var(--primary); }
`;
 
const HeroSub = styled.p`
  font-size: 1.05rem;
  color: rgba(255,255,255,0.65);
  margin-bottom: 2rem;
  font-weight: 500;
`;
 
const HeroSearch = styled.form`
  display: flex;
  align-items: center;
  background: white;
  border-radius: var(--radius-full);
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  gap: 0.75rem;
  max-width: 540px;
  margin: 0 auto;
 
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.95rem;
    color: var(--text-primary);
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    background: none;
    &::placeholder { color: var(--text-muted); font-weight: 500; }
  }
 
  button {
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    white-space: nowrap;
    &:hover { background: var(--primary-dark); }
  }
`;
 
const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 2rem;
 
  @media (max-width: 480px) { gap: 1.5rem; }
`;
 
const Stat = styled.div`
  text-align: center;
 
  .value {
    display: block;
    font-family: 'Sora', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: white;
  }
 
  .label {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
  }
`;
 
const ContentSection = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
 
  @media (max-width: 768px) { padding: 0 1rem; }
`;
 
const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2.5rem 0 1.25rem;
 
  h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--text-primary);
  }
 
  a {
    font-size: 0.88rem;
    color: var(--primary);
    font-weight: 700;
    &:hover { text-decoration: underline; }
  }
`;
 
export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
 
  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
  }
 
  return (
    <PageWrapper>
      <Header />
 
      <HeroSection>
        <HeroInner>
          <HeroBadge>🔥 +500 estabelecimentos disponíveis</HeroBadge>
          <HeroTitle>
            O que você quer<br />
            <span>comer hoje?</span>
          </HeroTitle>
          <HeroSub>Restaurantes e mercados perto de você • Entrega em até 30min</HeroSub>
          <HeroSearch onSubmit={handleSearch}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Busque por restaurante ou prato..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit"><Search size={16} /> Buscar</button>
          </HeroSearch>
          <HeroStats>
            <Stat><span className="value">30min</span><span className="label">Entrega média</span></Stat>
            <Stat><span className="value">4.8★</span><span className="label">Avaliação média</span></Stat>
            <Stat><span className="value">R$0</span><span className="label">1ª entrega</span></Stat>
          </HeroStats>
        </HeroInner>
      </HeroSection>
 
      <ContentSection>
        <PromotionalBanner />
 
        <SectionLabel>
          <h2>Explorar categorias</h2>
        </SectionLabel>
        <CategoriesCarousel />
 
        <SectionLabel>
          <h2>🍽️ Restaurantes próximos</h2>
          <a href="/Restaurantes">Ver todos</a>
        </SectionLabel>
        <StoreGrid titulo="" />
 
        <SectionLabel>
          <h2>🛒 Mercados & Conveniência</h2>
          <a href="/Mercados">Ver todos</a>
        </SectionLabel>
        <StoreGrid titulo="" tipo="mercado" />
      </ContentSection>
 
      <MobileNavBar />
    </PageWrapper>
  )
}