'use client'

import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'
import { TrocarPerfilButton } from '../../components/TrocarPerfilButton'

export default function GerentePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">🍕 FoodExpress</Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">Admin</p>
              <p className="text-sm text-gray-600">Gerente</p>  
            </div>
            <TrocarPerfilButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">📊 Dashboard Gerencial</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Faturamento Total</p>
            <p className="text-3xl font-bold text-green-600">R$ 48.2k</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Comissão Arrecadada</p>
            <p className="text-3xl font-bold text-blue-600">R$ 7.2k</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">Taxa Cancelamento</p>
            <p className="text-3xl font-bold text-red-600">3.2%</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-gray-600 text-sm">NPS Médio</p>
            <p className="text-3xl font-bold text-yellow-600">8.7</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded border">
            <h3 className="text-xl font-bold mb-4">Top Restaurantes</h3>
            <div className="space-y-2">
              {['Pizzaria do João', 'Burger King', 'Sushi Express'].map((nome, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b">
                  <p>{nome}</p>
                  <p className="font-bold text-orange-600">R$ {1200 - i*200}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded border">
            <h3 className="text-xl font-bold mb-4">Pedidos por Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><p>Entregues</p><p className="font-bold text-green-600">234</p></div>
              <div className="flex justify-between"><p>Preparando</p><p className="font-bold text-orange-600">12</p></div>
              <div className="flex justify-between"><p>Cancelados</p><p className="font-bold text-red-600">8</p></div>
            </div>
          </div>
        </div>

        <Link href="/relatorios" className="mt-8 inline-block bg-orange-600 text-white px-8 py-3 rounded hover:bg-orange-700 font-bold">
          📋 Ver Todos os Relatórios
        </Link>
      </main>
    </div>
  )
}
