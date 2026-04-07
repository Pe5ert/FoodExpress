import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import Home from './pages/Home'
import Login from './pages/Login'
import Restaurantes from './pages/Restaurantes'
import Mercados from './pages/Mercados'
import CadastroUsuario from './pages/CadastroUsuario'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import PaginaLoja from './pages/PaginaLoja'
import PaginaBusca from './pages/PaginaBusca'
import PerfilCliente from './pages/PerfilCliente'
import DashboardGerente from './pages/DashboardGerente'
import PaginaEntregador from './pages/PaginaEntregador'
import FinalizarCompra from './pages/FinalizarCompra'
import SelecionarPerfil from './pages/SelecionarPerfil'
import PainelRestaurante from './pages/PainelRestaurante'
import DetalhesPedido from './pages/DetalhesPedido'
import RastrearPedido from './pages/RastrearPedido'
import Suporte from './pages/Suporte'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { useAuth } from './contexts/AuthContext'

const PageWrapper = ({ children }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {children}
  </Motion.div>
)

function RotaProtegida({ children, perfil }) {
  const { estaLogado, usuario, carregando } = useAuth()
  if (carregando) return null
  if (!estaLogado) return <Navigate to="/login" replace />
  if (perfil && usuario?.perfil !== perfil) return <Navigate to="/" replace />
  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register/user" element={<PageWrapper><CadastroUsuario /></PageWrapper>} />
        <Route path="/register/store" element={<PageWrapper><CadastroEstabelecimento /></PageWrapper>} />
        <Route path="/Restaurantes" element={<PageWrapper><Restaurantes /></PageWrapper>} />
        <Route path="/Mercados" element={<PageWrapper><Mercados /></PageWrapper>} />
        <Route path="/loja/:id" element={<PageWrapper><PaginaLoja /></PageWrapper>} />
        <Route path="/busca" element={<PageWrapper><PaginaBusca /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><FinalizarCompra /></PageWrapper>} />

        {/* Páginas novas */}
        <Route path="/selecionar-perfil" element={<PageWrapper><SelecionarPerfil /></PageWrapper>} />
        <Route path="/suporte" element={<PageWrapper><Suporte /></PageWrapper>} />
        <Route path="/pedido/:id" element={<PageWrapper><DetalhesPedido /></PageWrapper>} />
        <Route path="/rastrear/:id" element={<PageWrapper><RastrearPedido /></PageWrapper>} />

        {/* Painel do restaurante (dono) */}
        <Route path="/painel-restaurante" element={
          <RotaProtegida perfil="restaurante">
            <PageWrapper><PainelRestaurante /></PageWrapper>
          </RotaProtegida>
        } />

        {/* Perfil do cliente */}
        <Route path="/perfil" element={
          <RotaProtegida perfil="cliente">
            <PageWrapper><PerfilCliente /></PageWrapper>
          </RotaProtegida>
        } />

        {/* Dashboard e rotas do gerente */}
        <Route path="/gerente/*" element={
          <RotaProtegida perfil="gerente">
            <PageWrapper><DashboardGerente /></PageWrapper>
          </RotaProtegida>
        } />

        {/* Painel do entregador */}
        <Route path="/entregador" element={
          <RotaProtegida perfil="entregador">
            <PageWrapper><PaginaEntregador /></PageWrapper>
          </RotaProtegida>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AnimatedRoutes />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
