'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'
import { TrocarPerfilButton } from '../../components/TrocarPerfilButton'

interface Restaurante {
  id: string
  nome: string
  status: string
  categoria: string
  avaliacao_media: number
  taxa_comissao: number
}

interface Pedido {
  id: string
  status: string
  total: number
  itens: string
  created_at: string
  cliente_id: string
}

interface ItemCardapio {
  id: string
  nome: string
  preco: number
  categoria: string
  disponivel: number
  descricao: string
}

export default function RestaurantePage() {
  const { user } = useUser()
  const [aba, setAba] = useState<'pedidos' | 'cardapio' | 'perfil'>('pedidos')
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Form novo item
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '', categoria: '', descricao: '', tempo_preparo: '30' })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch('/api/restaurantes/cadastro')
        if (!res.ok) throw new Error('Restaurante não encontrado')
        const rest = await res.json()
        setRestaurante(rest)

        const [resPedidos, resCardapio] = await Promise.all([
          fetch(`/api/pedidos?restauranteId=${rest.id}`),
          fetch(`/api/cardapio?restauranteId=${rest.id}`),
        ])

        if (resPedidos.ok) setPedidos(await resPedidos.json())
        if (resCardapio.ok) setCardapio(await resCardapio.json())
      } catch (err) {
        setErro('Erro ao carregar dados do restaurante.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const adicionarItem = async () => {
    if (!novoItem.nome || !novoItem.preco || !novoItem.categoria || !restaurante) return
    setSalvando(true)
    try {
      const res = await fetch('/api/cardapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restauranteId: restaurante.id,
          nome: novoItem.nome,
          preco: parseFloat(novoItem.preco),
          categoria: novoItem.categoria,
          descricao: novoItem.descricao,
          tempo_preparo: parseInt(novoItem.tempo_preparo),
        }),
      })
      if (res.ok) {
        const resCardapio = await fetch(`/api/cardapio?restauranteId=${restaurante.id}`)
        if (resCardapio.ok) setCardapio(await resCardapio.json())
        setNovoItem({ nome: '', preco: '', categoria: '', descricao: '', tempo_preparo: '30' })
      }
    } catch (err) {
      console.error('Erro ao adicionar item:', err)
    } finally {
      setSalvando(false)
    }
  }

  const atualizarStatusPedido = async (pedidoId: string, novoStatus: string) => {
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p))
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err)
    }
  }

  const corStatus = (status: string) => {
    const cores: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      preparando: 'bg-orange-100 text-orange-800',
      pronto: 'bg-purple-100 text-purple-800',
      entregando: 'bg-indigo-100 text-indigo-800',
      entregue: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    }
    return cores[status] || 'bg-gray-100 text-gray-800'
  }

  const proximoStatus: Record<string, string> = {
    pendente: 'confirmado',
    confirmado: 'preparando',
    preparando: 'pronto',
  }

  const faturamentoHoje = pedidos
    .filter(p => p.status === 'entregue' && new Date(p.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, p) => acc + Number(p.total), 0)

  const pedidosAtivos = pedidos.filter(p => !['entregue', 'cancelado'].includes(p.status))

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">🍽️</div><p className="text-gray-600">Carregando...</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">🍕 FoodExpress</Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{restaurante?.nome || user?.firstName}</p>
              <p className="text-sm text-gray-600">Restaurante
                {restaurante?.status === 'pendente' && <span className="ml-2 text-yellow-600 text-xs">⏳ Aguardando aprovação</span>}
                {restaurante?.status === 'ativo' && <span className="ml-2 text-green-600 text-xs">✅ Ativo</span>}
              </p>
            </div>
            <TrocarPerfilButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          {[
            { id: 'pedidos', label: `📦 Pedidos ${pedidosAtivos.length > 0 ? `(${pedidosAtivos.length})` : ''}` },
            { id: 'cardapio', label: '🍽️ Cardápio' },
            { id: 'perfil', label: '⚙️ Perfil' },
          ].map(t => (
            <button key={t.id} onClick={() => setAba(t.id as any)}
              className={`py-4 px-4 border-b-2 font-medium ${aba === t.id ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {erro && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{erro}</div>}

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Pedidos Ativos</p>
            <p className="text-3xl font-bold text-orange-600">{pedidosAtivos.length}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Faturamento Hoje</p>
            <p className="text-3xl font-bold text-green-600">R$ {faturamentoHoje.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Avaliação</p>
            <p className="text-3xl font-bold text-yellow-600">{Number(restaurante?.avaliacao_media || 0).toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Aba Pedidos */}
        {aba === 'pedidos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Pedidos Recebidos</h2>
            {pedidos.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border text-center">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-600">Nenhum pedido ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(pedido => (
                  <div key={pedido.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${corStatus(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </div>
                    <p className="font-bold text-orange-600 text-lg mb-3">R$ {Number(pedido.total).toFixed(2)}</p>
                    {proximoStatus[pedido.status] && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, proximoStatus[pedido.status])}
                        className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700"
                      >
                        Avançar → {proximoStatus[pedido.status]}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Cardápio */}
        {aba === 'cardapio' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Cardápio</h2>

            {/* Form adicionar item */}
            <div className="bg-white p-6 rounded-lg border mb-6">
              <h3 className="text-lg font-bold mb-4">➕ Adicionar Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input value={novoItem.nome} onChange={e => setNovoItem({ ...novoItem, nome: e.target.value })}
                  placeholder="Nome do item *" className="border rounded px-3 py-2 w-full" />
                <input value={novoItem.preco} onChange={e => setNovoItem({ ...novoItem, preco: e.target.value })}
                  placeholder="Preço (ex: 29.90) *" type="number" step="0.01" className="border rounded px-3 py-2 w-full" />
                <input value={novoItem.categoria} onChange={e => setNovoItem({ ...novoItem, categoria: e.target.value })}
                  placeholder="Categoria (ex: Pizzas) *" className="border rounded px-3 py-2 w-full" />
                <input value={novoItem.tempo_preparo} onChange={e => setNovoItem({ ...novoItem, tempo_preparo: e.target.value })}
                  placeholder="Tempo de preparo (min)" type="number" className="border rounded px-3 py-2 w-full" />
                <input value={novoItem.descricao} onChange={e => setNovoItem({ ...novoItem, descricao: e.target.value })}
                  placeholder="Descrição" className="border rounded px-3 py-2 w-full md:col-span-2" />
              </div>
              <button onClick={adicionarItem} disabled={salvando}
                className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Adicionar Item'}
              </button>
            </div>

            {/* Lista de itens */}
            {cardapio.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <p className="text-gray-600">Nenhum item no cardápio ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cardapio.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{item.nome}</h4>
                      <span className="text-green-600 font-bold">R$ {Number(item.preco).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{item.categoria}</p>
                    {item.descricao && <p className="text-sm text-gray-600">{item.descricao}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Perfil */}
        {aba === 'perfil' && (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6">⚙️ Dados do Restaurante</h2>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-semibold">Nome:</span> {restaurante?.nome}</p>
              <p><span className="font-semibold">Categoria:</span> {restaurante?.categoria}</p>
              <p><span className="font-semibold">Status:</span> {restaurante?.status}</p>
              <p><span className="font-semibold">Comissão da plataforma:</span> {restaurante?.taxa_comissao}%</p>
            </div>
            <p className="mt-6 text-sm text-gray-500">Para atualizar os dados do restaurante, entre em contato com o operador.</p>
          </div>
        )}
      </main>
    </div>
  )
}