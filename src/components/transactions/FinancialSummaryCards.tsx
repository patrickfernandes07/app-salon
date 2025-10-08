// src/components/transactions/FinancialSummaryCards.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { FinancialSummary } from "@/types/transaction"

interface FinancialSummaryCardsProps {
  summary: FinancialSummary | null
  loading?: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function FinancialSummaryCards({ summary, loading }: FinancialSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-1"></div>
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Dados financeiros indisponíveis</p>
      </div>
    )
  }

  // Extrai os valores corretos da estrutura
  const totalIncome = summary.totalIncome ?? 0
  const totalExpense = summary.totalExpense ?? 0
  const balance = summary.balance ?? 0
  const pendingPayments = summary.pendingPayments ?? 0
  const overduePayments = summary.overduePayments ?? 0
  const paidTransactions = summary.paidTransactions ?? 0
  const totalTransactions = summary.totalTransactions ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de entradas
          </p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de saídas
          </p>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Receitas - Despesas
          </p>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(pendingPayments)}
          </div>
          <p className="text-xs text-muted-foreground">
            Aguardando pagamento
          </p>
        </CardContent>
      </Card>

      {/* Vencidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(overduePayments)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos em atraso
          </p>
        </CardContent>
      </Card>

      {/* Pagas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paidTransactions}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalTransactions > 0 ? `de ${totalTransactions} pagas` : 'Nenhuma transação'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}