import styled from 'styled-components'
import {
  Utensils,
  ShoppingCart,
  Coffee,
  Pizza,
  Sandwich,
  Apple
} from 'lucide-react'

const CarouselContainer = styled.div`
  padding: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoriesList = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0 0.5rem;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  min-width: 80px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #FFF8F5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF6B35;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
  }

  span {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
  }
`;

const categories = [
  { icon: Utensils, name: 'Restaurantes' },
  { icon: ShoppingCart, name: 'Mercados' },
  { icon: Coffee, name: 'Cafés' },
  { icon: Pizza, name: 'Pizzas' },
  { icon: Sandwich, name: 'Lanches' },
  { icon: Apple, name: 'Saudável' },
]

export default function CategoriesCarousel() {
  return (
    <CarouselContainer>
      <CategoriesList>
        {categories.map((cat, index) => (
          <CategoryItem key={index}>
            <div className="icon">
              <cat.icon size={24} />
            </div>
            <span>{cat.name}</span>
          </CategoryItem>
        ))}
      </CategoriesList>
    </CarouselContainer>
  )
}

