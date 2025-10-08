// src/components/reports/ReportsComponent.tsx
"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useReports } from "@/hooks/useReports";
import { SummaryCards } from "./SummaryCards";
import { ReportCharts } from "./ReportCharts";
import { ReportTables } from "./ReportTables";

export function ReportsComponent() {
  const {
    financialDashboard,
    financialReport,
    appointmentReport,
    customerReport,
    dashboardSummary,
    loading,
    dateRange,
    updateDateRange,
    fetchAllReports,
  } = useReports();

  const [startDate, setStartDate] = useState<Date>(
    new Date(dateRange.startDate)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(dateRange.endDate));

  const handleApplyDateRange = () => {
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");
    updateDateRange(start, end);
  };

  const handleExport = () => {
  };

  if (loading && !financialDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando relatórios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho do seu negócio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Data Inicial */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Data inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Seletor de Data Final */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleApplyDateRange} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Aplicar
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Período Selecionado */}
      <div className="text-sm text-muted-foreground">
        Período: {format(new Date(dateRange.startDate), "dd/MM/yyyy")} até{" "}
        {format(new Date(dateRange.endDate), "dd/MM/yyyy")}
      </div>

      {/* Cards de Resumo */}
      <SummaryCards data={financialDashboard} loading={loading} />

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="tables">Tabelas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReportCharts
            financialDashboard={financialDashboard}
            financialReport={financialReport}
            appointmentReport={appointmentReport}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ReportCharts
            financialDashboard={financialDashboard}
            financialReport={financialReport}
            appointmentReport={appointmentReport}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <ReportTables
            customerReport={customerReport}
            financialReport={financialReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}