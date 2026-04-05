'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SelecionarRole() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selecionado, setSelecionado] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Verifica se o usuário já tem um role definido
  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    // Se o usuário já tem um role definido E NÃO veio de um "trocar perfil", redireciona
    const roleDefinido = user.unsafeMetadata?.role as string | undefined
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const estaVolTandoDePerfil = searchParams.get('trocar') === 'true'
    
    if (roleDefinido && !estaVolTandoDePerfil) {
      const rotasRole: Record<string, string> = {
        cliente: '/cliente',
        entregador: '/entregador',
        restaurante: '/restaurante',
        gerente: '/gerente',
      }
      const rota = rotasRole[roleDefinido]
      if (rota) {
        router.push(rota)
      }
    }
  }, [isLoaded, user, router])

  const roles = [
    { id: 'cliente', nome: 'Cliente', descricao: 'Fazer pedidos e acompanhar entregas', icon: '👤', rota: '/cliente' },
    { id: 'entregador', nome: 'Entregador', descricao: 'Aceitar e realizar entregas', icon: '🚗', rota: '/entregador' },
    { id: 'restaurante', nome: 'Restaurante', descricao: 'Gerenciar cardápio e pedidos', icon: '🍽️', rota: '/restaurante' },
    { id: 'gerente', nome: 'Gerente', descricao: 'Aprovar restaurantes, relatórios e configurações', icon: '📊', rota: '/gerente' },
  ]

  const continuar = async () => {
    const role = roles.find(r => r.id === selecionado)
    if (!role || !user) return

    setCarregando(true)
    setErro('')

    try {
      // Salva role no Clerk
      await user.update({ unsafeMetadata: { role: selecionado } })

      // Cria usuário no banco conforme o role
      const endpoints: Record<string, string> = {
        cliente: '/api/clientes',
        entregador: '/api/entregadores',
        restaurante: '/api/restaurantes/cadastro',
        gerente: '/api/gerentes',
      }

      const endpoint = endpoints[selecionado]
      if (endpoint) {
        await fetch(endpoint, { method: 'POST' })
      }

      router.push(role.rota)
    } catch (err) {
      console.error('Erro ao salvar role:', err)
      setErro('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">🍕 FoodExpress</h1>
          <p className="text-xl text-gray-700">Bem-vindo, {user?.firstName}!</p>
          <p className="text-gray-600 mt-2">
            {user?.unsafeMetadata?.role 
              ? `Seu perfil atual: ${((user.unsafeMetadata.role as string).charAt(0).toUpperCase() + (user.unsafeMetadata.role as string).slice(1))} - Escolha outro para trocar`
              : 'Escolha seu perfil para continuar'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelecionado(role.id)}
              className={`p-6 rounded-lg transition-all transform hover:scale-105 border-2 ${
                selecionado === role.id
                  ? 'bg-orange-500 border-orange-600 text-white shadow-lg'
                  : 'bg-white border-gray-200 text-gray-800 hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{role.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{role.nome}</h3>
              <p className={`text-sm ${selecionado === role.id ? 'text-orange-100' : 'text-gray-600'}`}>
                {role.descricao}
              </p>
            </button>
          ))}
        </div>

        {erro && (
          <p className="text-center text-red-600 mb-4">{erro}</p>
        )}

        <div className="flex justify-center">
          <button
            onClick={continuar}
            disabled={!selecionado || carregando}
            className={`px-12 py-4 rounded-lg font-semibold text-lg transition-colors ${
              selecionado && !carregando
                ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {carregando
              ? 'Salvando...'
              : `Continuar como ${selecionado ? roles.find(r => r.id === selecionado)?.nome : '...'}`}
          </button>
        </div>
      </div>
    </div>
  )
}