// src/components/services/ServicesComponent.tsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Users } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useServices } from "@/hooks/useServices"
import { ServiceForm } from "./ServiceForm"
import { DeleteServiceDialog } from "./DeleteServiceDialog"
import { AssignProfessionalsDialog } from "./AssignProfessionalsDialog"
import { createColumns } from "./columns"
import { Service, CreateServiceData, UpdateServiceData } from "@/types/service"
import { Professional } from "@/types/professional"
import { professionalService } from "@/services/professionalService"
import { toast } from "@/components/ui/use-toast"

export function ServicesComponent() {
  const {
    services,
    loading,
    submitting,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
  } = useServices()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignProfessionalsOpen, setIsAssignProfessionalsOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loadingProfessionals, setLoadingProfessionals] = useState(false)

  // Carregar profissionais
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoadingProfessionals(true)
        const response = await professionalService.getProfessionals(1) // companyId provisório
        setProfessionals(response.data)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar profissionais",
          variant: "destructive",
        })
      } finally {
        setLoadingProfessionals(false)
      }
    }

    fetchProfessionals()
  }, [])

  const handleCreate = async (data: CreateServiceData) => {
    try {
      await createService(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
  }

  const handleUpdate = async (data: UpdateServiceData) => {
    if (!editingService) return
    
    try {
      await updateService(editingService.id, data)
      setEditingService(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = (service: Service) => {
    setServiceToDelete(service)
  }

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    
    try {
      await deleteService(serviceToDelete.id)
      setServiceToDelete(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleStatus = async (service: Service) => {
    try {
      await toggleServiceStatus(service)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie seus serviços
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAssignProfessionalsOpen(true)}
            disabled={services.length === 0 || professionals.length === 0 || loadingProfessionals}
          >
            <Users className="mr-2 h-4 w-4" />
            Vincular Profissionais
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        searchKey="name"
        searchPlaceholder="Buscar serviços..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo serviço
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Atualize as informações do serviço
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            service={editingService || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingService(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Professionals Dialog */}
      <AssignProfessionalsDialog
        services={services}
        professionals={professionals}
        open={isAssignProfessionalsOpen}
        onOpenChange={setIsAssignProfessionalsOpen}
      />

      {/* Delete Dialog */}
      <DeleteServiceDialog
        service={serviceToDelete}
        open={!!serviceToDelete}
        onOpenChange={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />
    </div>
  )
}