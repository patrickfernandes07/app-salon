// src/components/products/StockUpdateDialog.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Product } from "@/types/product"
import React from "react"

const stockUpdateSchema = z.object({
  stock: z.number().min(0, "Estoque deve ser maior ou igual a zero"),
})

type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>

interface StockUpdateDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (newStock: number) => void
  isUpdating: boolean
}

export function StockUpdateDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
  isUpdating,
}: StockUpdateDialogProps) {
  const form = useForm<StockUpdateFormValues>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      stock: product?.stock || 0,
    },
  })

  // Reset form when product changes
  React.useEffect(() => {
    if (product) {
      form.reset({ stock: product.stock })
    }
  }, [product, form])

  const handleSubmit = async (values: StockUpdateFormValues) => {
    await onConfirm(values.stock)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Estoque</DialogTitle>
          <DialogDescription>
            Produto: <strong>{product?.name}</strong>
            <br />
            Estoque atual: {product?.stock} {product?.unit}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Estoque</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Atualizando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}