import styled from 'styled-components'
import { Tag, Truck } from 'lucide-react'

const BannerContainer = styled.div`
  background: #FF6B35;
  padding: 2rem;
  margin: 1rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h2 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
  }

  p {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
  }
`;

const IconContainer = styled.div`
  .delivery-icon {
    color: #fff;
    opacity: 0.8;
  }
`;

export default function PromotionalBanner() {
  return (
    <BannerContainer>
      <Content>
        <h2>Frete Grátis!</h2>
        <p>Na primeira compra acima de R$ 50</p>
      </Content>
      <IconContainer>
        <Truck size={64} className="delivery-icon" />
      </IconContainer>
    </BannerContainer>
  )
}

