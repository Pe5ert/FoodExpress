import styled from 'styled-components';
import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';
 
const FooterWrap = styled.footer`
  background: var(--secondary);
  color: rgba(255,255,255,0.75);
  margin-top: 4rem;
`;
 
const TopSection = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 3.5rem 2rem 2.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
 
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
 
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2.5rem 1.25rem 2rem;
  }
`;
 
const Brand = styled.div``;
 
const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
 
  .icon {
    width: 38px;
    height: 38px;
    background: var(--primary);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
 
  span {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    color: white;
    letter-spacing: -0.5px;
    em { color: var(--primary); font-style: normal; }
  }
`;
 
const BrandDesc = styled.p`
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 280px;
`;
 
const Socials = styled.div`
  display: flex;
  gap: 0.75rem;
 
  a {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.08);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.6);
    transition: all 0.2s;
 
    &:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
    }
  }
`;
 
const ContactItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.5rem;
`;
 
const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
  font-weight: 600;
 
  svg { color: var(--primary); flex-shrink: 0; }
`;
 
const Column = styled.div`
  h4 {
    font-family: 'Sora', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.25rem;
  }
 
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
 
  a {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    transition: all 0.2s;
 
    &:hover {
      color: white;
      padding-left: 4px;
    }
  }
`;
 
const BottomBar = styled.div`
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 1.25rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
 
  p {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
  }
 
  .badges {
    display: flex;
    gap: 0.5rem;
  }
 
  .badge {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.3px;
  }
 
  @media (max-width: 560px) { padding: 1.25rem; }
`;
 
export default function Footer() {
  return (
    <FooterWrap>
      <TopSection>
        <Brand>
          <BrandLogo>
            <div className="icon">🍔</div>
            <span>Food<em>Express</em></span>
          </BrandLogo>
          <BrandDesc>
            Conectamos você aos melhores restaurantes e mercados da sua região. Peça online e receba em casa com rapidez e praticidade.
          </BrandDesc>
          <Socials>
            <a href="#"><Instagram size={16} /></a>
            <a href="#"><Facebook size={16} /></a>
            <a href="#"><Youtube size={16} /></a>
            <a href="#"><Twitter size={16} /></a>
          </Socials>
          <ContactItems>
            <ContactItem><Mail size={14} /> suporte@foodexpress.com.br</ContactItem>
            <ContactItem><Phone size={14} /> (11) 3000-0000</ContactItem>
            <ContactItem><MapPin size={14} /> São Paulo, SP</ContactItem>
          </ContactItems>
        </Brand>
 
        <Column>
          <h4>Para clientes</h4>
          <ul>
            <li><a href="#">Como funciona</a></li>
            <li><a href="#">Rastrear pedido</a></li>
            <li><a href="#">Meus pedidos</a></li>
            <li><a href="#">Promoções</a></li>
            <li><a href="#">FoodExpress Pass</a></li>
          </ul>
        </Column>
 
        <Column>
          <h4>Para parceiros</h4>
          <ul>
            <li><a href="#">Cadastrar loja</a></li>
            <li><a href="#">Portal do parceiro</a></li>
            <li><a href="#">Seja entregador</a></li>
            <li><a href="#">Suporte parceiro</a></li>
          </ul>
        </Column>
 
        <Column>
          <h4>Empresa</h4>
          <ul>
            <li><a href="#">Sobre nós</a></li>
            <li><a href="#">Carreiras</a></li>
            <li><a href="#">Imprensa</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Termos de uso</a></li>
            <li><a href="#">Privacidade</a></li>
          </ul>
        </Column>
      </TopSection>
 
      <BottomBar>
        <p>© 2026 FoodExpress. Todos os direitos reservados.</p>
        <div className="badges">
          <span className="badge">SSL Seguro</span>
          <span className="badge">LGPD</span>
          <span className="badge">PCI DSS</span>
        </div>
      </BottomBar>
    </FooterWrap>
  );
}