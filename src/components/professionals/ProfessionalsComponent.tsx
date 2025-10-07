// src/components/professionals/ProfessionalsComponent.tsx
"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProfessionals } from "@/hooks/useProfessionals"
import { ProfessionalForm } from "./ProfessionalForm"
import { DeleteProfessionalDialog } from "./DeleteProfessionalDialog"
import { createColumns } from "./columns"
import { Professional, CreateProfessionalData, UpdateProfessionalData } from "@/types/professional"

export function ProfessionalsComponent() {
  const {
    professionals,
    loading,
    submitting,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    toggleProfessionalStatus,
  } = useProfessionals()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null)

  const handleCreate = async (data: CreateProfessionalData) => {
    try {
      await createProfessional(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
  }

  const handleUpdate = async (data: UpdateProfessionalData) => {
    if (!editingProfessional) return
    
    try {
      await updateProfessional(editingProfessional.id, data)
      setEditingProfessional(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = (professional: Professional) => {
    setProfessionalToDelete(professional)
  }

  const handleConfirmDelete = async () => {
    if (!professionalToDelete) return
    
    try {
      await deleteProfessional(professionalToDelete.id)
      setProfessionalToDelete(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleToggleStatus = async (professional: Professional) => {
    try {
      await toggleProfessionalStatus(professional)
    } catch (error) {
      console.error(error);
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando profissionais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de profissionais
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={professionals}
        searchKey="name"
        searchPlaceholder="Buscar profissionais..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Profissional</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo profissional
            </DialogDescription>
          </DialogHeader>
          <ProfessionalForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfessional} onOpenChange={() => setEditingProfessional(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
            <DialogDescription>
              Atualize as informações do profissional
            </DialogDescription>
          </DialogHeader>
          <ProfessionalForm
            professional={editingProfessional || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProfessional(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteProfessionalDialog
        professional={professionalToDelete}
        open={!!professionalToDelete}
        onOpenChange={() => setProfessionalToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />
    </div>
  )
}