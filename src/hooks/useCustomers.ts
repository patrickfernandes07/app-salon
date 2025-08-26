// src/hooks/useCustomers.ts
"use client";

import { useState, useEffect } from "react";
import { customerService } from "@/services/customerService";
import {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "@/types/customer";
import { toast } from "@/components/ui/use-toast";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (filters?: CustomerFilters) => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers(filters);
      setCustomers(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: CreateCustomerData) => {
    try {
      setSubmitting(true);
      const response = await customerService.createCustomer(data);
      setCustomers((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar cliente",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCustomer = async (id: number, data: UpdateCustomerData) => {
    try {
      setSubmitting(true);
      const response = await customerService.updateCustomer(id, data);
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === id ? response.data : customer))
      );
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      setSubmitting(true);
      await customerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCustomerStatus = async (customer: Customer) => {
    try {
      setSubmitting(true);
      const response = customer.isActive
        ? await customerService.deactivateCustomer(customer.id)
        : await customerService.activateCustomer(customer.id);

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? response.data : c))
      );

      toast({
        title: "Sucesso",
        description: `Cliente ${
          customer.isActive ? "desativado" : "ativado"
        } com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do cliente",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    submitting,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  };
};
