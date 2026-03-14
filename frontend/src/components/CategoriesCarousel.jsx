import styled from 'styled-components'
import { Utensils, ShoppingCart, Coffee, Pizza, Sandwich, Apple, Fish, IceCream, Beef, Salad } from 'lucide-react'
 
const Wrapper = styled.div`
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
`;
 
const List = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.25rem 0;
  min-width: max-content;
`;
 
const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  min-width: 72px;
 
  &:hover {
    background: var(--primary-light);
    .icon-box { border-color: var(--primary); background: var(--primary-light); }
    .icon-box svg { color: var(--primary); }
    span { color: var(--primary); }
  }
 
  &:active { transform: scale(0.95); }
 
  .icon-box {
    width: 58px;
    height: 58px;
    border-radius: var(--radius-md);
    background: var(--surface);
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
 
    svg { color: var(--text-secondary); transition: color 0.2s; }
  }
 
  span {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-align: center;
    transition: color 0.2s;
    line-height: 1.2;
  }
`;
 
const EmojiItem = styled(Item)`
  .emoji-box {
    width: 58px;
    height: 58px;
    border-radius: var(--radius-md);
    background: ${props => props.$bg || 'var(--surface)'};
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    transition: all 0.2s;
  }
 
  &:hover .emoji-box {
    border-color: var(--primary);
    transform: scale(1.05);
  }
`;
 
const categories = [
  { Icon: Utensils, name: 'Restaurantes', color: '#FFE8D6' },
  { Icon: ShoppingCart, name: 'Mercados', color: '#D6F5F2' },
  { Icon: Pizza, name: 'Pizzas', color: '#FFE0D6' },
  { Icon: Sandwich, name: 'Lanches', color: '#FFF3D6' },
  { Icon: Coffee, name: 'Cafés', color: '#EDD9C0' },
  { Icon: Fish, name: 'Frutos do Mar', color: '#D6E8FF' },
  { Icon: Apple, name: 'Saudável', color: '#D6FFDD' },
  { Icon: IceCream, name: 'Sobremesas', color: '#F5D6FF' },
  { Icon: Beef, name: 'Churrasco', color: '#FFD6D6' },
  { Icon: Salad, name: 'Saladas', color: '#D6FFE8' },
]
 
export default function CategoriesCarousel() {
  return (
    <Wrapper>
      <List>
        {categories.map((cat, i) => (
          <EmojiItem key={i} $bg={cat.color}>
            <div className="emoji-box">
              <cat.Icon size={22} color="#555" />
            </div>
            <span>{cat.name}</span>
          </EmojiItem>
        ))}
      </List>
    </Wrapper>
  )
}