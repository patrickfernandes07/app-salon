// src/components/transactions/FinancialSummaryCards.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle } from "lucide-react"
import { FinancialSummary } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils/currency"
import { safeNumber } from "@/lib/utils/type-guards"

interface FinancialSummaryCardsProps {
  summary: FinancialSummary | null
  loading?: boolean
}

export function FinancialSummaryCards({ summary, loading }: FinancialSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> {/* Ajustado para 5 colunas */}
        {Array.from({ length: 5 }).map((_, i) => ( // Ajustado para 5 skeletons
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

  const totalIncome = safeNumber(summary.summary?.totalIncome);
  const totalExpense = safeNumber(summary.summary?.totalExpense);
  const balance = safeNumber(summary.summary?.balance);
  const pendingPayments = safeNumber(summary.summary?.pendingTotal);
  const paidTransactions = safeNumber(summary.summary.paidTransactions);
  console.log(summary);
  //const totalTransactions = safeNumber(summary.totalTransactions); 


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> {/* Ajustado para 5 colunas */}
      {/* Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)} {/* Usa a função importada */}
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
            {formatCurrency(totalExpense)} {/* Usa a função importada */}
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
            {formatCurrency(balance)} {/* Usa a função importada */}
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
            {formatCurrency(pendingPayments)} {/* Usa a função importada */}
          </div>
          <p className="text-xs text-muted-foreground">
            Aguardando pagamento/recebimento
          </p>
        </CardContent>
      </Card>

      {/* Vencidas - REMOVIDO */}
      {/*
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(overduePayments)} // Usa a função importada
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos/Recebimentos em atraso
          </p>
        </CardContent>
      </Card>
      */}

      {/* Pagas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações Pagas</CardTitle> {/* Título ajustado */}
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paidTransactions}
          </div>
          <p className="text-xs text-muted-foreground">
            {paidTransactions > 0 ? `de ${paidTransactions} totais` : 'Nenhuma transação'} {/* Texto ajustado */}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}