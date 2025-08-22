// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth.context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barbershop Manager - Sistema de Gestão',
  description: 'Sistema completo de gestão para barbearias e salões de beleza',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}