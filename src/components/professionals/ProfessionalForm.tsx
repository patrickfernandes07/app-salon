// src/components/professionals/ProfessionalForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Professional, CreateProfessionalData, UpdateProfessionalData } from "@/types/professional"

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
})

type ProfessionalFormValues = z.infer<typeof professionalSchema>

interface ProfessionalFormProps {
  professional?: Professional
  onSubmit: (data: CreateProfessionalData | UpdateProfessionalData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function ProfessionalForm({ professional, onSubmit, onCancel, isSubmitting }: ProfessionalFormProps) {
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
      companyId: professional?.companyId || 1, // provisorio
    },
  })

  const handleSubmit = async (values: ProfessionalFormValues) => {
    const formattedValues = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      specialty: values.specialty || undefined,
      hireDate: values.hireDate || undefined,
      bio: values.bio || undefined,
      instagram: values.instagram || undefined,
      companyId: professional?.companyId || 1, // provisorio
    }
    
    await onSubmit(formattedValues)
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