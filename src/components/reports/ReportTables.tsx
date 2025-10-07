// src/components/reports/ReportTables.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomerReport, FinancialReport } from "@/types/report";
import { Trophy, TrendingUp, Users } from "lucide-react";

interface ReportTablesProps {
  customerReport: CustomerReport | null;
  financialReport: FinancialReport | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function ReportTables({
  customerReport,
  financialReport,
}: ReportTablesProps) {
  if (!customerReport || !financialReport) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle>Top 10 Clientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Agendamentos</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerReport.topCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                customerReport.topCustomers.map((customer, index) => (
                  <TableRow key={customer.customerId}>
                    <TableCell className="font-medium">
                      <Badge
                        variant={index < 3 ? "default" : "secondary"}
                        className={
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-600"
                                : ""
                        }
                      >
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {customer.appointmentsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Receita por Profissional */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>Receita por Profissional</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialReport.revenue.byProfessional.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma receita por profissional
                  </TableCell>
                </TableRow>
              ) : (
                financialReport.revenue.byProfessional
                  .sort((a, b) => b.amount - a.amount)
                  .map((prof, index) => (
                    <TableRow key={prof.professionalId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{prof.name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(prof.amount)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estatísticas de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Estatísticas de Clientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Total de Clientes</span>
              <Badge className="text-lg">{customerReport.total}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Clientes Ativos</span>
              <Badge className="text-lg bg-green-600">
                {customerReport.active}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Clientes Inativos</span>
              <Badge variant="secondary" className="text-lg">
                {customerReport.inactive}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">Novos Clientes (30d)</span>
              <Badge className="text-lg bg-yellow-600">
                {customerReport.newCustomers}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Ticket Médio</span>
              <span className="text-lg font-bold text-purple-600">
                {formatCurrency(customerReport.averageTicket)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-600">
                Receitas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Total Recebido</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(financialReport.revenue.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Receitas Pendentes</span>
                  <span className="font-semibold text-yellow-600">
                    {formatCurrency(financialReport.pending.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">Receitas Vencidas</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(financialReport.overdue.income)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-red-600">
                Despesas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">Total Pago</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(financialReport.expenses.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Despesas Pendentes</span>
                  <span className="font-semibold text-yellow-600">
                    {formatCurrency(financialReport.pending.expense)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">Despesas Vencidas</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(financialReport.overdue.expense)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-semibold">Saldo Final</span>
                <span
                  className={`text-xl font-bold ${financialReport.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(financialReport.balance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}