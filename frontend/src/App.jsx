import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/login"
import Restaurantes from "./pages/Restaurantes"
import Mercados from "./pages/Mercados"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Restaurantes" element={<Restaurantes />} />
      <Route path="/Mercados" element={<Mercados />} />
    </Routes>
  )
}

export default App
