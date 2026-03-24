import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">🍕 FoodExpress</h1>
          <p className="text-2xl text-gray-700 mb-2">Sistema de Delivery Inteligente</p>
          <p className="text-gray-600">Gerenciar restaurantes, pedidos e entregas em tempo real</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 border-2 border-orange-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Bem-vindo!</h2>

          <div className="space-y-3 mb-8">
            <Link
              href="/sign-in"
              className="block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              🔑 Fazer Login
            </Link>
            <Link
              href="/sign-up"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              ✏️ Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}