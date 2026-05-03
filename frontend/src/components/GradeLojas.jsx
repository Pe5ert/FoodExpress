import { useState, useEffect } from 'react'
import StoreCard from './CartaoLoja'
import api from '../services/api'

export default function StoreGrid({ tipo }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setErro('')
    api.restaurantes.listar(tipo && tipo !== 'mercado' ? { categoria: tipo } : {})
      .then(dados => {
        const normalizados = dados.map(r => ({
          ...r,
          emoji: r.emoji || '🍽️',
          avaliacao: r.avaliacao_media ?? 0,
          tempoEntrega: r.tempo_medio_preparo ? `${r.tempo_medio_preparo}-${r.tempo_medio_preparo + 10} min` : '30-40 min',
          taxaEntrega: 'Grátis',
        }))
        setLista(normalizados)
      })
      .catch(err => {
        if (err.message?.includes('Backend offline') || err.message?.includes('fetch')) {
          setErro('backend_offline')
        } else {
          console.error(err)
          setErro('erro_generico')
        }
      })
      .finally(() => setCarregando(false))
  }, [tipo])

  if (carregando) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    )
  }

  if (erro === 'backend_offline') {
    return (
      <div className="text-center py-16 text-text-muted bg-surface-2 rounded-2xl border border-border">
        <p className="text-4xl mb-3">🔌</p>
        <p className="font-bold text-text-primary mb-1">Backend offline</p>
        <p className="text-sm font-semibold">Inicie o servidor: <code className="bg-white px-2 py-0.5 rounded text-xs font-mono border border-border">cd backend && npm run dev</code></p>
      </div>
    )
  }

  if (!lista.length) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="font-semibold">Nenhum restaurante encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {lista.map((loja, i) => (
        <StoreCard key={loja.id} loja={loja} index={i} />
      ))}
    </div>
  )
}
