"use client";

import { useState, useEffect, useCallback } from "react";
import { transactionService } from "@/services/transactionService";
import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  FinancialSummary,
} from "@/types/transaction";
import { toast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "@/contexts/auth.context";

const getSafeDateRange = (dateRange: DateRange | undefined) => {
  if (!dateRange || !dateRange.from) {
    const today = new Date();
    return {
      startDate: startOfMonth(today).toISOString(),
      endDate: endOfMonth(today).toISOString(),
    };
  }

  if (dateRange.from && !dateRange.to) {
    return {
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.from.toISOString(),
    };
  }

  return {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to!.toISOString(),
  };
};

export const useTransactions = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [tableKey, setTableKey] = useState(0);

  const fetchTransactions = useCallback(
    async (startDate: string, endDate: string) => {
      if (!companyId) return;

      try {
        setLoading(true);
        const response = await transactionService.getTransactions(
          companyId,
          startDate,
          endDate
        );

        setTransactions(response.data);
        setTableKey((prev) => prev + 1);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar transações",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  const fetchFinancialSummary = useCallback(
    async (startDate: string, endDate: string) => {
      if (!companyId) return;

      try {
        const response = await transactionService.getFinancialSummary(
          companyId,
          startDate,
          endDate
        );
        setFinancialSummary(response.data);
      } catch (error) {
        console.error("Erro ao buscar resumo financeiro:", error);
      }
    },
    [companyId]
  );

  const applyDateFilter = useCallback(async () => {
    const { startDate, endDate } = getSafeDateRange(dateRange);

    await Promise.all([
      fetchTransactions(startDate, endDate),
      fetchFinancialSummary(startDate, endDate),
    ]);
  }, [dateRange, fetchTransactions, fetchFinancialSummary]);

  useEffect(() => {
    if (companyId) {
      const { startDate, endDate } = getSafeDateRange(dateRange);
      fetchTransactions(startDate, endDate);
      fetchFinancialSummary(startDate, endDate);
    }
  }, [companyId]);

  const createTransaction = useCallback(
    async (data: CreateTransactionData) => {
      if (!companyId) return;
      const dataWithCompany = { ...data, companyId };
      try {
        setSubmitting(true);
        await transactionService.createTransaction(dataWithCompany);
        toast({ title: "Sucesso", description: "Transação criada" });
        await applyDateFilter();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar",
          variant: "destructive",
        });
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [companyId, applyDateFilter]
  );

  const updateTransaction = useCallback(
    async (id: number, data: UpdateTransactionData) => {
      try {
        setSubmitting(true);
        await transactionService.updateTransaction(id, data);
        toast({ title: "Sucesso", description: "Transação atualizada" });
        await applyDateFilter();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar",
          variant: "destructive",
        });
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [applyDateFilter]
  );

  const deleteTransaction = useCallback(
    async (id: number) => {
      try {
        setSubmitting(true);
        await transactionService.deleteTransaction(id);
        toast({ title: "Sucesso", description: "Transação excluída" });
        await applyDateFilter();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir",
          variant: "destructive",
        });
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [applyDateFilter]
  );

  const markAsPaid = useCallback(
    async (transaction: Transaction) => {
      try {
        setSubmitting(true);
        await transactionService.markAsPaid(transaction.id);
        toast({ title: "Sucesso", description: "Transação marcada como paga" });
        await applyDateFilter();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao marcar como paga",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [applyDateFilter]
  );

  const cancelTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        setSubmitting(true);
        await transactionService.cancelTransaction(transaction.id);
        toast({ title: "Sucesso", description: "Transação cancelada" });
        await applyDateFilter();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao cancelar",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [applyDateFilter]
  );

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return {
    transactions,
    loading,
    submitting,
    financialSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    cancelTransaction,
    dateRange,
    handleDateChange,
    applyDateFilter,
    tableKey,
  };
};
