import { useState } from 'react'
import './App.css'
//teste de coisa
function App() {
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