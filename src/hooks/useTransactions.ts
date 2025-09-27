// src/hooks/useTransactions.ts
"use client";

import { useState, useEffect } from "react";
import { transactionService } from "@/services/transactionService";
import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  FinancialSummary,
} from "@/types/transaction";
import { toast } from "@/components/ui/use-toast";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions(1); // provisorio
      setTransactions(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar transações",
        variant: "destructive",
      });
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const response = await transactionService.getFinancialSummary(1); // provisorio
      setFinancialSummary(response.data);
    } catch (error) {
      console.error("Erro ao buscar resumo financeiro:", error);
    }
  };

  const createTransaction = async (data: CreateTransactionData) => {
    try {
      setSubmitting(true);
      const response = await transactionService.createTransaction(data);
      setTransactions((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso",
      });
      await fetchFinancialSummary(); // Atualiza o resumo
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar transação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateTransaction = async (id: number, data: UpdateTransactionData) => {
    try {
      setSubmitting(true);
      const response = await transactionService.updateTransaction(id, data);
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? response.data : transaction
        )
      );
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      });
      await fetchFinancialSummary(); // Atualiza o resumo
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      setSubmitting(true);
      await transactionService.deleteTransaction(id);
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id)
      );
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
      await fetchFinancialSummary(); // Atualiza o resumo
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const markAsPaid = async (transaction: Transaction) => {
    try {
      setSubmitting(true);
      const response = await transactionService.markAsPaid(transaction.id);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? response.data : t))
      );
      toast({
        title: "Sucesso",
        description: "Transação marcada como paga",
      });
      await fetchFinancialSummary(); // Atualiza o resumo
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar transação como paga",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const cancelTransaction = async (transaction: Transaction) => {
    try {
      setSubmitting(true);
      const response = await transactionService.cancelTransaction(
        transaction.id
      );
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? response.data : t))
      );
      toast({
        title: "Sucesso",
        description: "Transação cancelada com sucesso",
      });
      await fetchFinancialSummary(); // Atualiza o resumo
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar transação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchFinancialSummary();
  }, []);

  return {
    transactions,
    loading,
    submitting,
    financialSummary,
    fetchTransactions,
    fetchFinancialSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    cancelTransaction,
  };
};
