// src/components/transactions/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash, CheckCircle, X, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Transaction, 
  TransactionTypeLabels, 
  TransactionCategoryLabels, 
  PaymentMethodLabels, 
  TransactionStatusLabels,
  TransactionType,
  TransactionStatus 
} from "@/types/transaction"

interface ColumnActionsProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onMarkAsPaid: (transaction: Transaction) => void
  onCancel: (transaction: Transaction) => void
}

const ColumnActions = ({ transaction, onEdit, onDelete, onMarkAsPaid, onCancel }: ColumnActionsProps) => {
  const canMarkAsPaid = transaction.status === TransactionStatus.PENDING || transaction.status === TransactionStatus.OVERDUE
  const canCancel = transaction.status !== TransactionStatus.PAID && transaction.status !== TransactionStatus.CANCELLED

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(transaction.id.toString())}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(transaction)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {canMarkAsPaid && (
          <DropdownMenuItem onClick={() => onMarkAsPaid(transaction)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Marcar como Pago
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem onClick={() => onCancel(transaction)}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(transaction)}
          className="text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const getStatusVariant = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.PAID:
      return 'default' // green
    case TransactionStatus.PENDING:
      return 'secondary' // gray
    case TransactionStatus.OVERDUE:
      return 'destructive' // red
    case TransactionStatus.CANCELLED:
      return 'outline' // outline
    default:
      return 'secondary'
  }
}

export const createColumns = (
  onEdit: (transaction: Transaction) => void,
  onDelete: (transaction: Transaction) => void,
  onMarkAsPaid: (transaction: Transaction) => void,
  onCancel: (transaction: Transaction) => void
): ColumnDef<Transaction>[] => [
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      return (
        <div className="font-medium max-w-[200px] truncate">
          {transaction.description}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as TransactionType
      const isIncome = type === TransactionType.INCOME
      return (
        <Badge variant={isIncome ? "default" : "destructive"}>
          {TransactionTypeLabels[type]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.getValue("category") as keyof typeof TransactionCategoryLabels
      return (
        <Badge variant="outline">
          {TransactionCategoryLabels[category]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      const isIncome = transaction.type === TransactionType.INCOME
      return (
        <div className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(transaction.amount)}
        </div>
      )
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Método",
    cell: ({ row }) => {
      const paymentMethod = row.getValue("paymentMethod") as keyof typeof PaymentMethodLabels
      return (
        <div className="text-sm">
          {PaymentMethodLabels[paymentMethod]}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TransactionStatus
      return (
        <Badge variant={getStatusVariant(status)}>
          {TransactionStatusLabels[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate") as string
      if (!dueDate) return <div className="text-sm text-muted-foreground">-</div>
      
      const date = new Date(dueDate)
      const isOverdue = date < new Date() && row.original.status === TransactionStatus.PENDING
      
      return (
        <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
          {date.toLocaleDateString("pt-BR")}
        </div>
      )
    },
  },
  {
    accessorKey: "installments",
    header: "Parcelas",
    cell: ({ row }) => {
      const transaction = row.original
      if (transaction.installments <= 1) {
        return <div className="text-sm text-muted-foreground">À vista</div>
      }
      return (
        <div className="text-sm">
          {transaction.currentInstallment}/{transaction.installments}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-sm">{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original
      return (
        <ColumnActions
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          onCancel={onCancel}
        />
      )
    },
  },
]