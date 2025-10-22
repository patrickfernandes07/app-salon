// src/app/layout.tsx - Layout raiz limpo
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'
import { AuthProvider } from '@/contexts/auth.context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SalonTime',
  description: 'Sistema de gestão para barbearias',
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}