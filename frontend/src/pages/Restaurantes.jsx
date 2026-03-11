import styled from 'styled-components'
import Header from '../components/Header'
import StoreGrid from '../components/StoreGrid'
import MobileNavBar from '../components/MobileNavBar'

const Container = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`

export default function Restaurantes() {
  return (
    <Container>
      <Header />
      <StoreGrid titulo="Restaurantes" />
      <MobileNavBar />
    </Container>
  )
}

