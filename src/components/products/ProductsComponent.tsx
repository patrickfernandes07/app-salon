// src/components/products/ProductsComponent.tsx
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
import { useProducts } from "@/hooks/useProducts"
import { ProductForm } from "./ProductForm"
import { DeleteProductDialog } from "./DeleteProductDialog"

import { createColumns } from "./columns"
import { Product, CreateProductData, UpdateProductData } from "@/types/product"
import { StockUpdateDialog } from "./StockUpdateDialog"

export function ProductsComponent() {
  const {
    products,
    loading,
    submitting,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateStock,
  } = useProducts()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null)

  const handleCreate = async (data: CreateProductData) => {
    try {
      await createProduct(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleUpdate = async (data: UpdateProductData) => {
    if (!editingProduct) return
    
    try {
      await updateProduct(editingProduct.id, data)
      setEditingProduct(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      await deleteProduct(productToDelete.id)
      setProductToDelete(null)
    } catch (error) {
      console.error(error);
    }
  }

  const handleToggleStatus = async (product: Product) => {
    try {
      await toggleProductStatus(product)
    } catch (error) {
      console.error(error);
    }
  }

  const handleUpdateStock = (product: Product) => {
    setStockUpdateProduct(product)
  }

  const handleConfirmStockUpdate = async (newStock: number) => {
    if (!stockUpdateProduct) return
    
    try {
      await updateStock(stockUpdateProduct, newStock)
      setStockUpdateProduct(null)
    } catch (error) {
      console.error(error);
    }
  }

  const columns = createColumns(handleEdit, handleDelete, handleToggleStatus, handleUpdateStock)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e estoque
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Buscar produtos..."
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo produto
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteProductDialog
        product={productToDelete}
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={submitting}
      />

      {/* Stock Update Dialog */}
      <StockUpdateDialog
        product={stockUpdateProduct}
        open={!!stockUpdateProduct}
        onOpenChange={() => setStockUpdateProduct(null)}
        onConfirm={handleConfirmStockUpdate}
        isUpdating={submitting}
      />
    </div>
  )
}