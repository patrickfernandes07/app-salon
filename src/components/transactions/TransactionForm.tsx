// src/components/transactions/TransactionForm.tsx
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
import { 
  Transaction, 
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionType, 
  TransactionCategory, 
  PaymentMethod,
  TransactionTypeLabels,
  TransactionCategoryLabels,
  PaymentMethodLabels
} from "@/types/transaction"

const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: "Selecione um tipo válido" })
  }),
  category: z.nativeEnum(TransactionCategory, {
    errorMap: () => ({ message: "Selecione uma categoria válida" })
  }),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres"),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Selecione um método de pagamento válido" })
  }),
  installments: z.number().min(1, "Número de parcelas deve ser pelo menos 1").optional(),
  dueDate: z.string().optional(),
  professionalId: z.number().optional(),
  appointmentId: z.number().optional(),
  companyId: z.number().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (data: CreateTransactionData | UpdateTransactionData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function TransactionForm({ transaction, onSubmit, onCancel, isSubmitting }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || TransactionType.INCOME,
      category: transaction?.category || TransactionCategory.OTHER,
      amount: transaction?.amount || 0,
      description: transaction?.description || "",
      paymentMethod: transaction?.paymentMethod || PaymentMethod.CASH,
      installments: transaction?.installments || 1,
      dueDate: transaction?.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : "",
      professionalId: transaction?.professionalId || undefined,
      appointmentId: transaction?.appointmentId || undefined,
      companyId: transaction?.companyId || 1, // provisório
    },
  })

  const handleSubmit = async (values: TransactionFormValues) => {
    const formattedValues = {
      ...values,
      dueDate: values.dueDate || undefined,
      professionalId: values.professionalId || undefined,
      appointmentId: values.appointmentId || undefined,
      installments: values.installments || 1,
      companyId: transaction?.companyId || 1, // provisório
    }
    
    await onSubmit(formattedValues)
  }

  const selectedType = form.watch("type")
  const selectedCategory = form.watch("category")

  // Filtrar categorias baseadas no tipo selecionado
  const getAvailableCategories = () => {
    if (selectedType === TransactionType.INCOME) {
      return [
        TransactionCategory.SERVICE_PAYMENT,
        TransactionCategory.PRODUCT_SALE,
        TransactionCategory.OTHER
      ]
    } else {
      return [
        TransactionCategory.COMMISSION,
        TransactionCategory.SALARY,
        TransactionCategory.RENT,
        TransactionCategory.UTILITIES,
        TransactionCategory.SUPPLIES,
        TransactionCategory.MARKETING,
        TransactionCategory.EQUIPMENT,
        TransactionCategory.OTHER
      ]
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TransactionTypeLabels).map(([value, label]) => (
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {TransactionCategoryLabels[category]}
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Valor em reais (R$)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PaymentMethodLabels).map(([value, label]) => (
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
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcelas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Número de parcelas (1 = à vista)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Deixe em branco para pagamento à vista
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a transação..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações detalhadas sobre a transação
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
            {isSubmitting ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}