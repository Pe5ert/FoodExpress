'use client'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export function TrocarPerfilButton() {
  const { user } = useUser()
  
  if (!user?.unsafeMetadata?.role) return null

  const perfilNomes: Record<string, string> = {
    cliente: '👤 Cliente',
    entregador: '🚴 Entregador',
    restaurante: '🏪 Restaurante',
    gerente: '🔐 Gerente',
  }

  const perfilAtual = perfilNomes[(user.unsafeMetadata.role as string) || '']

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-blue-800">
        Perfil: <strong>{perfilAtual}</strong>
      </span>
      <Link
        href="/selecionar-role?trocar=true"
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        title="Trocar de perfil"
      >
        🔄 Trocar
      </Link>
    </div>
  )
}
