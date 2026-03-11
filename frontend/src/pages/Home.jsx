import styled from 'styled-components'
import Header from '../components/Header'
import AddressSelector from '../components/AddressSelector'
import CategoriesCarousel from '../components/CategoriesCarousel'
import PromotionalBanner from '../components/PromotionalBanner'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`

const TopBar = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1rem;
`

export default function Home() {
  return (
    <Container>
      <Header />
      <TopBar>
        <AddressSelector />
      </TopBar>
      <PromotionalBanner />
      <CategoriesCarousel />
      <StoreGrid titulo="Restaurantes Próximos" />
      <MobileNavBar />
    </Container>
  )
}
