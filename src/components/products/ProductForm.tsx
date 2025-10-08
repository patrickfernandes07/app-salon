// src/components/products/ProductForm.tsx
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
import { Product, CreateProductData, UpdateProductData, ProductCategory, ProductCategoryLabels, ProductUnits } from "@/types/product"
import { useState } from "react"

const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  category: z.nativeEnum(ProductCategory, {
    errorMap: () => ({ message: "Selecione uma categoria válida" })
  }),
  costPrice: z.number().min(0, "Preço de custo deve ser maior ou igual a zero"),
  salePrice: z.number().min(0.01, "Preço de venda deve ser maior que zero"),
  stock: z.number().min(0, "Estoque deve ser maior ou igual a zero"),
  minStock: z.number().min(0, "Estoque mínimo deve ser maior ou igual a zero"),
  unit: z.string().min(1, "Selecione uma unidade"),
  image: z.string().optional(),
  companyId: z.number().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
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
  const cleanValue = value
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(cleanValue) || 0
}

// Função para formatar enquanto digita
const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  const amount = parseFloat(numbers) / 100
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function ProductForm({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const [costPriceDisplay, setCostPriceDisplay] = useState(
    product?.costPrice ? formatCurrency(product.costPrice) : ''
  )
  const [salePriceDisplay, setSalePriceDisplay] = useState(
    product?.salePrice ? formatCurrency(product.salePrice) : ''
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      barcode: product?.barcode || "",
      brand: product?.brand || "",
      category: product?.category || ProductCategory.OTHER,
      costPrice: product?.costPrice || 0,
      salePrice: product?.salePrice || 0,
      stock: product?.stock || 0,
      minStock: product?.minStock || 0,
      unit: product?.unit || "UN",
      image: product?.image || "",
      companyId: product?.companyId || 1, // provisório
    },
  })

  const handleSubmit = async (values: ProductFormValues) => {
    const formattedValues = {
      ...values,
      description: values.description || undefined,
      barcode: values.barcode || undefined,
      brand: values.brand || undefined,
      image: values.image || undefined,
      companyId: product?.companyId || 1, // provisório
    }
    
    await onSubmit(formattedValues)
  }

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    setCostPriceDisplay(formatted)
    
    const numericValue = parseCurrencyToNumber(formatted)
    form.setValue('costPrice', numericValue)
  }

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    setSalePriceDisplay(formatted)
    
    const numericValue = parseCurrencyToNumber(formatted)
    form.setValue('salePrice', numericValue)
  }

  const calculateMargin = () => {
    const costPrice = form.watch("costPrice") || 0
    const salePrice = form.watch("salePrice") || 0
    
    if (costPrice === 0) return 0
    return ((salePrice - costPrice) / costPrice) * 100
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
                  <Input placeholder="Digite o nome do produto" {...field} />
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
                    {Object.entries(ProductCategoryLabels).map(([value, label]) => (
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
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a marca" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Barras</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o código de barras" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ProductUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
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
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Custo *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={costPriceDisplay}
                    onChange={handleCostPriceChange}
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
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={salePriceDisplay}
                    onChange={handleSalePriceChange}
                  />
                </FormControl>
                <FormDescription>
                  Margem: {calculateMargin().toFixed(2)}%
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Atual *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Alerta quando estoque atingir este valor
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o produto..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações adicionais sobre o produto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://exemplo.com/imagem.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link para imagem do produto
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
            {isSubmitting ? "Salvando..." : product ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}