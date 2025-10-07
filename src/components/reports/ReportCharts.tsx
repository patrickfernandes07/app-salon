// src/components/reports/ReportCharts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FinancialDashboard,
  FinancialReport,
  AppointmentReport,
} from "@/types/report";

interface ReportChartsProps {
  financialDashboard: FinancialDashboard | null;
  financialReport: FinancialReport | null;
  appointmentReport: AppointmentReport | null;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function ReportCharts({
  financialDashboard,
  financialReport,
  appointmentReport,
}: ReportChartsProps) {
  if (!financialDashboard || !financialReport || !appointmentReport) {
    return null;
  }

  // Dados para gráfico de despesas por categoria
  const expensesData = financialDashboard.expensesBreakdown.map((item) => ({
    name: item.category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: item.totalAmount,
    count: item.totalTransactions,
  }));

  // Dados para gráfico de top serviços
  const topServicesData = financialDashboard.summary.topServices.map(
    (service) => ({
      name: service.serviceName,
      receita: service.totalRevenue,
      quantidade: service.totalQuantity,
    })
  );

  // Dados para gráfico de receita por método de pagamento
  const paymentMethodData = Object.entries(
    financialReport.revenue.byPaymentMethod
  ).map(([method, value]) => ({
    name: method
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: value,
  }));

  // Dados para gráfico de status de agendamentos
  const appointmentStatusData = Object.entries(
    appointmentReport.byStatus
  ).map(([status, count]) => ({
    name: status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
  }));

  // Dados para gráfico de profissionais
  const professionalData = appointmentReport.byProfessional.map((prof) => ({
    name: prof.name,
    agendamentos: prof.count,
    receita: prof.revenue,
  }));

  // Dados de receita vs despesas
  const revenueExpenseData = [
    {
      name: "Receitas",
      valor: financialDashboard.revenue,
    },
    {
      name: "Despesas",
      valor: financialDashboard.expenses,
    },
    {
      name: "Lucro",
      valor: financialDashboard.profit,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Receitas vs Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="valor" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServicesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="receita" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={professionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="agendamentos"
                fill="#3b82f6"
                name="Agendamentos"
              />
              <Bar
                yAxisId="right"
                dataKey="receita"
                fill="#10b981"
                name="Receita (R$)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}