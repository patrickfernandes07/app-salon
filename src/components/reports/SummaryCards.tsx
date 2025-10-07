// src/components/reports/SummaryCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { FinancialDashboard } from "@/types/report";

interface SummaryCardsProps {
  data: FinancialDashboard | null;
  loading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  if (loading || !data) {
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
    );
  }

  const growthPositive = data.revenueGrowth >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.revenue)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {growthPositive ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <p
              className={`text-xs ${growthPositive ? "text-green-600" : "text-red-600"}`}
            >
              {formatPercentage(data.revenueGrowth)} vs período anterior
            </p>
          </div>
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
            {formatCurrency(data.expenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.expensesBreakdown.length} categorias
          </p>
        </CardContent>
      </Card>

      {/* Lucro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <DollarSign
            className={`h-4 w-4 ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(data.profit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Margem: {data.profitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Agendamentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.summary.totalAppointments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Taxa de conclusão: {data.summary.completionRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(data.summary.averageTicket)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Por agendamento</p>
        </CardContent>
      </Card>

      {/* Breakdown de Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fontes de Receita
          </CardTitle>
          <Users className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Agendamentos
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(data.revenueBreakdown.appointments)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Outras Receitas
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(data.revenueBreakdown.otherIncome)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}