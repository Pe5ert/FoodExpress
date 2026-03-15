import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import Home from "./pages/Home"
import Login from "./pages/login"
import Restaurantes from "./pages/Restaurantes"
import Mercados from "./pages/Mercados"
import UserRegister from "./pages/UserRegister"
import StoreRegister from "./pages/StoreRegister"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register/user" element={<PageWrapper><UserRegister /></PageWrapper>} />
        <Route path="/register/store" element={<PageWrapper><StoreRegister /></PageWrapper>} />
        <Route path="/Restaurantes" element={<PageWrapper><Restaurantes /></PageWrapper>} />
        <Route path="/Mercados" element={<PageWrapper><Mercados /></PageWrapper>} />
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
