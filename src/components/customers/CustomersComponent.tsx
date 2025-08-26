// src/components/customers/CustomersComponent.tsx
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
import { useCustomers } from "@/hooks/useCustomers"
import { CustomerForm } from "./CustomerForm"
import { DeleteCustomerDialog } from "./DeleteCustomerDialog"
import { createColumns } from "./columns"
import { Customer, CreateCustomerData, UpdateCustomerData } from "@/types/customer"

export function CustomersComponent() {
  const {
    customers,
    loading,
    submitting,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  } = useCustomers()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  const handleCreate = async (data: CreateCustomerData) => {
    try {
      await createCustomer(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
  }

  const handleUpdate = async (data: UpdateCustomerData) => {
    if (!editingCustomer) return
    
    try {
      await updateCustomer(editingCustomer.id, data)
      setEditingCustomer(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    
    try {
      await deleteCustomer(customerToDelete.id)
      setCustomerToDelete(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleToggleStatus = async (customer: Customer) => {
    try {
      await toggleCustomerStatus(customer)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Buscar clientes..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo cliente
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCustomer(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteCustomerDialog
        customer={customerToDelete}
        open={!!customerToDelete}
        onOpenChange={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />
    </div>
  )
}