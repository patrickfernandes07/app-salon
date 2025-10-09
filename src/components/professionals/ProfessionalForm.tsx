// src/components/professionals/ProfessionalForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Professional, CreateProfessionalData, UpdateProfessionalData } from "@/types/professional"
import { Service } from "@/types/service"
import { serviceService } from "@/services/serviceService"
import { professionalService } from "@/services/professionalService"
import { toast } from "@/components/ui/use-toast"

const professionalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  commission: z.number("A comissão é obrigatória")
    .positive("A comissão deve ser maior que 0")
    .min(0.01, "A comissão deve ser maior que 0")
    .max(100, "Comissão não pode ser maior que 100"),
  hireDate: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  companyId: z.number().optional(),
  serviceIds: z.array(z.number()).optional(),
})

type ProfessionalFormValues = z.infer<typeof professionalSchema>

interface ProfessionalFormProps {
  professional?: Professional
  onSubmit: (data: CreateProfessionalData | UpdateProfessionalData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function ProfessionalForm({ professional, onSubmit, onCancel, isSubmitting }: ProfessionalFormProps) {
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: professional?.name || "",
      email: professional?.email || "",
      phone: professional?.phone || "",
      specialty: professional?.specialty || "",
      commission: professional?.commission ? Number(professional.commission) : undefined,
      hireDate: professional?.hireDate ? new Date(professional.hireDate).toISOString().split('T')[0] : "",
      bio: professional?.bio || "",
      instagram: professional?.instagram || "",
      companyId: professional?.companyId || 1,
      serviceIds: [],
    },
  })

  // Buscar serviços disponíveis
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)
        const response = await serviceService.getServices(1) // companyId provisório
        setServices(response.data)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar serviços",
          variant: "destructive",
        })
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  // Buscar serviços do profissional ao editar
  useEffect(() => {
    const fetchProfessionalServices = async () => {
      if (professional?.id) {
        try {
          const response = await professionalService.getProfessionalServices(professional.id)
          const serviceIds = response.data.map((ps: any) => ps.serviceId)
          setSelectedServices(serviceIds)
          form.setValue('serviceIds', serviceIds)
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao carregar serviços do profissional",
            variant: "destructive",
          })
        }
      }
    }

    if (professional?.id && services.length > 0) {
      fetchProfessionalServices()
    }
  }, [professional, services])

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => {
      const newSelection = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
      
      form.setValue('serviceIds', newSelection)
      return newSelection
    })
  }

  const handleSubmit = async (values: ProfessionalFormValues) => {
    const formattedValues = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      specialty: values.specialty || undefined,
      hireDate: values.hireDate || undefined,
      bio: values.bio || undefined,
      instagram: values.instagram || undefined,
      companyId: professional?.companyId || 1,
    }
    
    await onSubmit(formattedValues)

    // Gerenciar serviços após criar/atualizar profissional
    if (professional?.id) {
      await updateProfessionalServices(professional.id)
    }
  }

  const updateProfessionalServices = async (professionalId: number) => {
    try {
      // Buscar serviços atuais
      const currentResponse = await professionalService.getProfessionalServices(professionalId)
      const currentServiceIds = currentResponse.data.map((ps: any) => ps.serviceId)

      // Serviços para adicionar
      const toAdd = selectedServices.filter(id => !currentServiceIds.includes(id))
      
      // Serviços para remover
      const toRemove = currentServiceIds.filter((id: number) => !selectedServices.includes(id))

      // Adicionar novos serviços
      for (const serviceId of toAdd) {
        await professionalService.assignService(professionalId, serviceId)
      }

      // Remover serviços
      for (const serviceId of toRemove) {
        await professionalService.removeService(professionalId, serviceId)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviços do profissional",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Barbeiro, Cabeleireiro" {...field} />
                </FormControl>
                <FormDescription>
                  Área de atuação do profissional
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comissão (%) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 50" 
                    step="0.01"
                    min="0.01"
                    max="100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value)
                      field.onChange(value)
                    }}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Porcentagem de comissão sobre serviços (obrigatório)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Contratação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="@usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Username do Instagram (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Conte um pouco sobre o profissional..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Breve descrição sobre o profissional
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seção de Serviços */}
        <div className="space-y-3 border-t pt-4">
          <div>
            <FormLabel>Serviços</FormLabel>
            <FormDescription>
              Selecione os serviços que este profissional pode realizar
            </FormDescription>
          </div>
          
          {loadingServices ? (
            <div className="text-sm text-muted-foreground">Carregando serviços...</div>
          ) : services.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum serviço cadastrado</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 border rounded-md">
              {services.map((service) => (
                <div key={service.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {service.name}
                    {service.price && (
                      <span className="text-muted-foreground ml-1">
                        - R$ {Number(service.price).toFixed(2)}
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : professional ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}