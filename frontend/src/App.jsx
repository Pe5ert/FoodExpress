import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/login"
import Restaurantes from "./pages/Restaurantes"
import Mercados from "./pages/Mercados"
import UserRegister from "./pages/UserRegister"
import StoreRegister from "./pages/StoreRegister"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/user" element={<UserRegister />} />
          <Route path="/register/store" element={<StoreRegister />} />
          <Route path="/Restaurantes" element={<Restaurantes />} />
          <Route path="/Mercados" element={<Mercados />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
