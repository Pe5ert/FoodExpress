import styled from 'styled-components'
import { MapPin, ChevronDown } from 'lucide-react'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .icon {
    color: #FF6B35;
  }

  .address {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
  }

  .chevron {
    color: #666;
  }
`;

export default function AddressSelector() {
  return (
    <Container>
      <MapPin size={18} className="icon" />
      <span className="address">Av. Principal, 123</span>
      <ChevronDown size={16} className="chevron" />
    </Container>
  )
}

