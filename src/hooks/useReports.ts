// src/hooks/useReports.ts
"use client";

import { useState, useEffect } from "react";
import { reportService } from "@/services/reportService";
import {
  FinancialDashboard,
  FinancialReport,
  AppointmentReport,
  CustomerReport,
  DashboardSummary,
} from "@/types/report";
import { toast } from "@/components/ui/use-toast";

export const useReports = (companyId: number = 1) => {
  const [financialDashboard, setFinancialDashboard] =
    useState<FinancialDashboard | null>(null);
  const [financialReport, setFinancialReport] =
    useState<FinancialReport | null>(null);
  const [appointmentReport, setAppointmentReport] =
    useState<AppointmentReport | null>(null);
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(
    null
  );
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Data padrão: mês atual
  const getDefaultDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  const fetchFinancialDashboard = async (
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const response = await reportService.getFinancialDashboard(
        companyId,
        startDate,
        endDate
      );
      setFinancialDashboard(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dashboard financeiro",
        variant: "destructive",
      });
      console.error("Erro ao buscar dashboard financeiro:", error);
    }
  };

  const fetchFinancialReport = async (startDate: string, endDate: string) => {
    try {
      const response = await reportService.getFinancialReport(
        startDate,
        endDate,
        companyId
      );
      setFinancialReport(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatório financeiro",
        variant: "destructive",
      });
      console.error("Erro ao buscar relatório financeiro:", error);
    }
  };

  const fetchAppointmentReport = async (startDate: string, endDate: string) => {
    try {
      const response = await reportService.getAppointmentReport(
        startDate,
        endDate,
        companyId
      );
      setAppointmentReport(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatório de agendamentos",
        variant: "destructive",
      });
      console.error("Erro ao buscar relatório de agendamentos:", error);
    }
  };

  const fetchCustomerReport = async () => {
    try {
      const response = await reportService.getCustomerReport(companyId);
      setCustomerReport(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatório de clientes",
        variant: "destructive",
      });
      console.error("Erro ao buscar relatório de clientes:", error);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await reportService.getDashboardSummary(companyId);
      setDashboardSummary(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar resumo do dashboard",
        variant: "destructive",
      });
      console.error("Erro ao buscar resumo do dashboard:", error);
    }
  };

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFinancialDashboard(dateRange.startDate, dateRange.endDate),
        fetchFinancialReport(dateRange.startDate, dateRange.endDate),
        fetchAppointmentReport(dateRange.startDate, dateRange.endDate),
        fetchCustomerReport(),
        fetchDashboardSummary(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateDateRange = async (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    setLoading(true);
    try {
      await Promise.all([
        fetchFinancialDashboard(startDate, endDate),
        fetchFinancialReport(startDate, endDate),
        fetchAppointmentReport(startDate, endDate),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    financialDashboard,
    financialReport,
    appointmentReport,
    customerReport,
    dashboardSummary,
    loading,
    dateRange,
    updateDateRange,
    fetchAllReports,
  };
};
