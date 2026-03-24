import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'FoodExpress - Delivery de Comida',
  description: 'O melhor delivery da sua região',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className="bg-gray-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}