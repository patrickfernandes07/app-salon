// src/components/services/AssignProfessionalsDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Professional } from "@/types/professional"
import { Service } from "@/types/service"
import { professionalService } from "@/services/professionalService"

interface AssignProfessionalsDialogProps {
  services: Service[]
  professionals: Professional[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignProfessionalsDialog({
  services,
  professionals,
  open,
  onOpenChange,
}: AssignProfessionalsDialogProps) {
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedProfessionals, setSelectedProfessionals] = useState<number[]>([])
  const [currentProfessionals, setCurrentProfessionals] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Carregar profissionais vinculados ao serviço selecionado
  useEffect(() => {
    const fetchServiceProfessionals = async () => {
      if (!selectedService) {
        setSelectedProfessionals([])
        setCurrentProfessionals([])
        return
      }

      try {
        setLoading(true)
        // Buscar todos os profissionais e verificar quais têm o serviço
        const professionalIds: number[] = []
        
        for (const professional of professionals) {
          try {
            const response = await professionalService.getProfessionalServices(professional.id)
            const hasService = response.data.some(
              (ps: any) => ps.serviceId === parseInt(selectedService)
            )
            if (hasService) {
              professionalIds.push(professional.id)
            }
          } catch (error) {
            console.error(`Erro ao verificar profissional ${professional.id}:`, error)
          }
        }
        
        setSelectedProfessionals(professionalIds)
        setCurrentProfessionals(professionalIds)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar profissionais do serviço",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServiceProfessionals()
  }, [selectedService, professionals])

  const handleProfessionalToggle = (professionalId: number) => {
    setSelectedProfessionals((prev) =>
      prev.includes(professionalId)
        ? prev.filter((id) => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  const handleSelectAll = () => {
    const activeProfessionalIds = professionals
      .filter((p) => p.isActive)
      .map((p) => p.id)
      
    if (selectedProfessionals.length === activeProfessionalIds.length) {
      setSelectedProfessionals([])
    } else {
      setSelectedProfessionals(activeProfessionalIds)
    }
  }

  const handleSubmit = async () => {
    if (!selectedService) {
      toast({
        title: "Atenção",
        description: "Selecione um serviço",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const serviceId = parseInt(selectedService)

      // Profissionais para adicionar o serviço
      const toAdd = selectedProfessionals.filter(
        (id) => !currentProfessionals.includes(id)
      )

      // Profissionais para remover o serviço
      const toRemove = currentProfessionals.filter(
        (id) => !selectedProfessionals.includes(id)
      )

      // Adicionar serviço aos profissionais
      for (const professionalId of toAdd) {
        await professionalService.assignService(professionalId, serviceId)
      }

      // Remover serviço dos profissionais
      for (const professionalId of toRemove) {
        await professionalService.removeService(professionalId, serviceId)
      }

      toast({
        title: "Sucesso",
        description: "Profissionais vinculados com sucesso",
      })

      handleClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao vincular profissionais",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedService("")
    setSelectedProfessionals([])
    setCurrentProfessionals([])
    onOpenChange(false)
  }

  const activeServices = services.filter((s) => s.isActive)
  const activeProfessionals = professionals.filter((p) => p.isActive)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Profissionais ao Serviço</DialogTitle>
          <DialogDescription>
            Selecione um serviço e marque os profissionais que podem realizá-lo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seletor de Serviço */}
          <div className="space-y-2">
            <Label>Serviço *</Label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {activeServices.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Nenhum serviço ativo
                  </div>
                ) : (
                  activeServices.map((service) => (
                    <SelectItem
                      key={service.id}
                      value={service.id.toString()}
                    >
                      {service.name}
                      <span className="text-muted-foreground ml-1">
                        - R$ {service.price.toFixed(2)}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Profissionais */}
          {selectedService && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Profissionais disponíveis</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={loading || activeProfessionals.length === 0}
                >
                  {selectedProfessionals.length === activeProfessionals.length
                    ? "Desmarcar todos"
                    : "Marcar todos"}
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Carregando...
                    </p>
                  </div>
                </div>
              ) : activeProfessionals.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum profissional ativo disponível
                </div>
              ) : (
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-3">
                    {activeProfessionals.map((professional) => (
                      <div
                        key={professional.id}
                        className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                      >
                        <Checkbox
                          id={`professional-${professional.id}`}
                          checked={selectedProfessionals.includes(professional.id)}
                          onCheckedChange={() => handleProfessionalToggle(professional.id)}
                        />
                        <label
                          htmlFor={`professional-${professional.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{professional.name}</div>
                          {professional.specialty && (
                            <div className="text-sm text-muted-foreground">
                              {professional.specialty}
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="text-sm text-muted-foreground">
                {selectedProfessionals.length} de {activeProfessionals.length} profissionais
                selecionados
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedService || submitting || loading}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}