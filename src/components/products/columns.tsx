// src/components/products/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash, Ban, CheckCircle, Package, AlertTriangle } from "lucide-react"
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
import { Product, ProductCategoryLabels } from "@/types/product"

interface ColumnActionsProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  onUpdateStock: (product: Product) => void
}

const ColumnActions = ({ product, onEdit, onDelete, onToggleStatus, onUpdateStock }: ColumnActionsProps) => {
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
          onClick={() => navigator.clipboard.writeText(product.id.toString())}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateStock(product)}>
          <Package className="mr-2 h-4 w-4" />
          Atualizar Estoque
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(product)}>
          {product.isActive ? (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Desativar
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Ativar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(product)}
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

export const createColumns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  onToggleStatus: (product: Product) => void,
  onUpdateStock: (product: Product) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center space-x-2">
          <div className="font-medium">{product.name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.getValue("category") as keyof typeof ProductCategoryLabels
      return (
        <Badge variant="outline">
          {ProductCategoryLabels[category]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "brand",
    header: "Marca",
    cell: ({ row }) => {
      const brand = row.getValue("brand") as string
      return brand ? (
        <div className="text-sm">{brand}</div>
      ) : (
        <div className="text-sm text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Preço Custo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("costPrice") as number
      return (
        <div className="font-medium text-orange-600">
          {formatCurrency(price)}
        </div>
      )
    },
  },
  {
    accessorKey: "salePrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Preço Venda
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("salePrice") as number
      return (
        <div className="font-medium text-green-600">
          {formatCurrency(price)}
        </div>
      )
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const product = row.original
      const isLowStock = product.stock <= product.minStock
      
      return (
        <div className="flex items-center space-x-2">
          <div className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
            {product.stock} {product.unit}
          </div>
          {isLowStock && (
            <AlertTriangle className="h-4 w-4 text-red-500" title="Estoque baixo" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "minStock",
    header: "Estoque Mín.",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="text-sm text-muted-foreground">
          {product.minStock} {product.unit}
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
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
      const product = row.original
      return (
        <ColumnActions
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onUpdateStock={onUpdateStock}
        />
      )
    },
  },
]