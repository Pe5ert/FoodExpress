import styled from 'styled-components'
import { MapPin, ChevronDown } from 'lucide-react'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  border: 1px solid transparent;
  min-width: 280px;
  font-weight: 500;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.2);
    border-color: var(--primary);
  }

  .icon {
    color: var(--primary);
    flex-shrink: 0;
  }

  .address {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
    flex: 1;
  }

  .chevron {
    color: var(--text-secondary);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  &:hover .chevron {
    transform: rotate(180deg);
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

