'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'
import { TrocarPerfilButton } from '../../components/TrocarPerfilButton'

interface Entregador {
  id: string
  nome: string
  status: string
  veiculo_tipo: string
  avaliacao_media: number
  total_entregas: number
  latitude: number
  longitude: number
}

interface Pedido {
  id: string
  status: string
  total: number
  endereco_entrega: string
  distancia_km: number
  created_at: string
  restaurante_id: string
}

export default function EntregadorPage() {
  const { user } = useUser()
  const [aba, setAba] = useState<'entregas' | 'historico' | 'perfil'>('entregas')
  const [entregador, setEntregador] = useState<Entregador | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizandoStatus, setAtualizandoStatus] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch('/api/entregadores/cadastro')
        if (!res.ok) throw new Error('Entregador não encontrado')
        const ent = await res.json()
        setEntregador(ent)

        const resPedidos = await fetch(`/api/pedidos?entregadorId=${ent.id}`)
        if (resPedidos.ok) setPedidos(await resPedidos.json())
      } catch (err) {
        setErro('Erro ao carregar dados.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const alternarDisponibilidade = async () => {
    if (!entregador) return
    setAtualizandoStatus(true)
    const novoStatus = entregador.status === 'disponivel' ? 'indisponivel' : 'disponivel'
    try {
      await fetch(`/api/entregadores/${entregador.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      setEntregador({ ...entregador, status: novoStatus })
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setAtualizandoStatus(false)
    }
  }

  const atualizarLocalizacao = () => {
    if (!navigator.geolocation || !entregador) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        await fetch(`/api/entregadores/${entregador.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude }),
        })
        setEntregador({ ...entregador, latitude, longitude })
        alert('Localização atualizada!')
      } catch (err) {
        console.error('Erro ao atualizar localização:', err)
      }
    })
  }

  const confirmarEntrega = async (pedidoId: string) => {
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'entregue' }),
      })
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'entregue' } : p))
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err)
    }
  }

  const pedidosAtivos = pedidos.filter(p => ['entregando', 'pronto'].includes(p.status))
  const historico = pedidos.filter(p => ['entregue', 'cancelado'].includes(p.status))
  const ganhos = historico
    .filter(p => p.status === 'entregue')
    .reduce((acc, p) => acc + Number(p.distancia_km || 0) * 1.5, 0)

  const corStatus = (status: string) => {
    const cores: Record<string, string> = {
      pronto: 'bg-purple-100 text-purple-800',
      entregando: 'bg-blue-100 text-blue-800',
      entregue: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    }
    return cores[status] || 'bg-gray-100 text-gray-800'
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">🚗</div><p className="text-gray-600">Carregando...</p></div>
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
              <p className="font-semibold">{entregador?.nome || user?.firstName}</p>
              <p className="text-sm text-gray-600">Entregador</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${entregador?.status === 'disponivel' ? 'bg-green-500' : 'bg-red-500'}`} title={entregador?.status} />
            <TrocarPerfilButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          {[
            { id: 'entregas', label: `🚗 Entregas Ativas ${pedidosAtivos.length > 0 ? `(${pedidosAtivos.length})` : ''}` },
            { id: 'historico', label: '📋 Histórico' },
            { id: 'perfil', label: '👤 Perfil' },
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
            <p className="text-gray-600 text-sm">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full ${entregador?.status === 'disponivel' ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-xl font-bold capitalize">{entregador?.status}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Total de Entregas</p>
            <p className="text-3xl font-bold text-orange-600">{entregador?.total_entregas || historico.filter(p => p.status === 'entregue').length}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Avaliação</p>
            <p className="text-3xl font-bold text-yellow-600">{Number(entregador?.avaliacao_media || 0).toFixed(1)} ⭐</p>
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={alternarDisponibilidade}
            disabled={atualizandoStatus}
            className={`py-3 rounded-lg font-semibold transition-colors ${
              entregador?.status === 'disponivel'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {atualizandoStatus ? 'Atualizando...' : entregador?.status === 'disponivel' ? '🔴 Ficar Indisponível' : '🟢 Ficar Disponível'}
          </button>
          <button
            onClick={atualizarLocalizacao}
            className="py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            📍 Atualizar Localização
          </button>
        </div>

        {/* Aba Entregas Ativas */}
        {aba === 'entregas' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Entregas Ativas</h2>
            {pedidosAtivos.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border text-center">
                <div className="text-4xl mb-4">🚗</div>
                <p className="text-gray-600">Nenhuma entrega ativa no momento.</p>
                <p className="text-sm text-gray-500 mt-2">Fique disponível para receber pedidos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosAtivos.map(pedido => (
                  <div key={pedido.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.id.slice(-6)}</p>
                        <p className="font-semibold mt-1">📍 {pedido.endereco_entrega}</p>
                        {pedido.distancia_km && (
                          <p className="text-sm text-gray-500">{Number(pedido.distancia_km).toFixed(1)} km</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${corStatus(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </div>
                    <p className="font-bold text-orange-600 mb-3">R$ {Number(pedido.total).toFixed(2)}</p>
                    {pedido.status === 'entregando' && (
                      <button
                        onClick={() => confirmarEntrega(pedido.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        ✅ Confirmar Entrega
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Histórico */}
        {aba === 'historico' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Histórico de Entregas</h2>
            {historico.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-600">Nenhuma entrega realizada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historico.map(pedido => (
                  <div key={pedido.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">#{pedido.id.slice(-6)} • {new Date(pedido.created_at).toLocaleDateString('pt-BR')}</p>
                      <p className="text-sm text-gray-600 mt-1">📍 {pedido.endereco_entrega}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${corStatus(pedido.status)}`}>{pedido.status}</span>
                      <p className="font-bold text-orange-600 mt-1">R$ {Number(pedido.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Perfil */}
        {aba === 'perfil' && (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6">👤 Meu Perfil</h2>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-semibold">Nome:</span> {entregador?.nome}</p>
              <p><span className="font-semibold">Veículo:</span> {entregador?.veiculo_tipo}</p>
              <p><span className="font-semibold">Status:</span> {entregador?.status}</p>
              <p><span className="font-semibold">Total de entregas:</span> {entregador?.total_entregas}</p>
              <p><span className="font-semibold">Avaliação:</span> {Number(entregador?.avaliacao_media || 0).toFixed(1)} ⭐</p>
            </div>
            <p className="mt-6 text-sm text-gray-500">Para atualizar seus dados, entre em contato com o suporte.</p>
          </div>
        )}
      </main>
    </div>
  )
}