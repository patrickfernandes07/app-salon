// src/hooks/useProducts.ts
"use client";

import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { Product, CreateProductData, UpdateProductData } from "@/types/product";
import { toast } from "@/components/ui/use-toast";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts(1); // provisorio
      setProducts(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductData) => {
    try {
      setSubmitting(true);
      const response = await productService.createProduct(data);
      setProducts((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProduct = async (id: number, data: UpdateProductData) => {
    try {
      setSubmitting(true);
      const response = await productService.updateProduct(id, data);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? response.data : product))
      );
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setSubmitting(true);
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      setSubmitting(true);
      const response = product.isActive
        ? await productService.deactivateProduct(product.id)
        : await productService.activateProduct(product.id);

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? response.data : p))
      );

      toast({
        title: "Sucesso",
        description: `Produto ${
          product.isActive ? "desativado" : "ativado"
        } com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateStock = async (product: Product, newStock: number) => {
    try {
      setSubmitting(true);
      const response = await productService.updateStock(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? response.data : p))
      );

      toast({
        title: "Sucesso",
        description: "Estoque atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    submitting,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateStock,
  };
};
