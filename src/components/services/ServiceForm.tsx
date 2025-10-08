// src/components/services/ServiceForm.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Service, CreateServiceData, UpdateServiceData, ServiceCategory, ServiceCategoryLabels } from "@/types/service"
import { useState } from "react"

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  duration: z.number().min(1, "Duração deve ser pelo menos 1 minuto"),
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: "Selecione uma categoria válida" })
  }),
  color: z.string().optional(),
  companyId: z.number().optional(),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  service?: Service
  onSubmit: (data: CreateServiceData | UpdateServiceData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

// Função para formatar o valor em reais
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Função para converter string formatada em número
const parseCurrencyToNumber = (value: string): number => {
  // Remove R$, espaços, pontos (milhares) e substitui vírgula por ponto
  const cleanValue = value
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(cleanValue) || 0
}

// Função para formatar enquanto digita
const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  // Converte para número dividindo por 100 (centavos)
  const amount = parseFloat(numbers) / 100
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const [priceDisplay, setPriceDisplay] = useState(
    service?.price ? formatCurrency(service.price) : ''
  )

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      price: service?.price || 0,
      duration: service?.duration || 60,
      category: service?.category || ServiceCategory.OTHER,
      color: service?.color || "#3b82f6",
      companyId: service?.companyId || 1, // provisório
    },
  })

  const handleSubmit = async (values: ServiceFormValues) => {
    const formattedValues = {
      ...values,
      description: values.description || undefined,
      color: values.color || undefined,
      companyId: service?.companyId || 1, // provisório
    }
    
    await onSubmit(formattedValues)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    setPriceDisplay(formatted)
    
    // Atualiza o valor numérico no form
    const numericValue = parseCurrencyToNumber(formatted)
    form.setValue('price', numericValue)
  }

  // Duração em horas e minutos para facilitar a entrada
  const durationInMinutes = form.watch("duration")
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60

  const setDuration = (h: number, m: number) => {
    form.setValue("duration", h * 60 + m)
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
                  <Input placeholder="Digite o nome do serviço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ServiceCategoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={priceDisplay}
                    onChange={handlePriceChange}
                  />
                </FormControl>
                <FormDescription>
                  Digite o valor em reais
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      className="w-16 h-10 p-1 border rounded"
                      {...field}
                    />
                    <Input
                      type="text"
                      placeholder="#3b82f6"
                      className="flex-1"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Cor para exibição no calendário
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração *</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        placeholder="0"
                        value={hours}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0, minutes)}
                        className="w-20"
                      />
                      <span className="text-sm">h</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        placeholder="30"
                        value={minutes}
                        onChange={(e) => setDuration(hours, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm">min</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Total: {Math.floor(field.value / 60)}h {field.value % 60}min
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o serviço oferecido..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre o serviço
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
            {isSubmitting ? "Salvando..." : service ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}