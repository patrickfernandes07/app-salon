// src/components/transactions/TransactionsComponent.tsx
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { TransactionForm } from "./TransactionForm"
import { DeleteTransactionDialog } from "./DeleteTransactionDialog"
import { FinancialSummaryCards } from "./FinancialSummaryCards"
import { createColumns } from "./columns"
import { Transaction, CreateTransactionData, UpdateTransactionData } from "@/types/transaction"
import { useTransactions } from "@/hooks/useTransactions"

export function TransactionsComponent() {
  const {
    transactions,
    loading,
    submitting,
    financialSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    cancelTransaction,
  } = useTransactions()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const handleCreate = async (data: CreateTransactionData) => {
    try {
      await createTransaction(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleUpdate = async (data: UpdateTransactionData) => {
    if (!editingTransaction) return
    
    try {
      await updateTransaction(editingTransaction.id, data)
      setEditingTransaction(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
  }

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return
    
    try {
      await deleteTransaction(transactionToDelete.id)
      setTransactionToDelete(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleMarkAsPaid = async (transaction: Transaction) => {
    try {
      await markAsPaid(transaction)
    } catch (error) {
      console.error(error);
    }
  }

  const handleCancel = async (transaction: Transaction) => {
    try {
      await cancelTransaction(transaction)
    } catch (error) {
      console.error(error);
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleMarkAsPaid, handleCancel)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando transações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas transações financeiras
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <FinancialSummaryCards summary={financialSummary} loading={loading} />

      {/* Tabela de Transações */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={transactions}
          searchKey="description"
          searchPlaceholder="Buscar transações..."
        />
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Preencha as informações da nova transação
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Atualize as informações da transação
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        transaction={transactionToDelete}
        open={!!transactionToDelete}
        onOpenChange={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />
    </div>
  )
}