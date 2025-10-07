// src/components/professionals/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash, UserX, UserCheck } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Professional } from "@/types/professional"

interface ColumnActionsProps {
  professional: Professional
  onEdit: (professional: Professional) => void
  onDelete: (professional: Professional) => void
  onToggleStatus: (professional: Professional) => void
}

const ColumnActions = ({ professional, onEdit, onDelete, onToggleStatus }: ColumnActionsProps) => {
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
          onClick={() => navigator.clipboard.writeText(professional.id.toString())}
        >
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(professional)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(professional)}>
          {professional.isActive ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Desativar
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Ativar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(professional)}
          className="text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export const createColumns = (
  onEdit: (professional: Professional) => void,
  onDelete: (professional: Professional) => void,
  onToggleStatus: (professional: Professional) => void
): ColumnDef<Professional>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profissional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const professional = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={professional.avatar} alt={professional.name} />
            <AvatarFallback>{getInitials(professional.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{professional.name}</div>
            {professional.specialty && (
              <div className="text-xs text-muted-foreground">{professional.specialty}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return email ? (
        <div className="text-sm text-muted-foreground">{email}</div>
      ) : (
        <div className="text-sm text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return phone ? (
        <div className="text-sm">{phone}</div>
      ) : (
        <div className="text-sm text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "commission",
    header: "Comissão",
    cell: ({ row }) => {
      const commission = parseFloat(row.getValue("commission") as string)
      return (
        <div className="text-sm font-medium">{commission.toFixed(2)}%</div>
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
          Cadastrado em
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
      const professional = row.original
      return (
        <ColumnActions
          professional={professional}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      )
    },
  },
]