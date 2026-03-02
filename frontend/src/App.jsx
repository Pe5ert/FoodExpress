import { useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchFromAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/usuarios')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      setData(json)
    } catch (error) {
      setError(error.message)
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>FoodExpress</h1>
      
      <button onClick={fetchFromAPI} disabled={loading}>
        {loading ? 'Carregando...' : 'Buscar Dados'}
      </button>

      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      
      {data && (
        <div>
          <h3>Resposta:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
