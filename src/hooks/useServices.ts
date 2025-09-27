// src/hooks/useServices.ts
"use client";

import { useState, useEffect } from "react";
import { serviceService } from "@/services/serviceService";
import { CreateServiceData, Service, UpdateServiceData } from "@/types/service";
import { toast } from "@/components/ui/use-toast";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getServices(1); // provisorio
      setServices(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços",
        variant: "destructive",
      });
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (data: CreateServiceData) => {
    try {
      setSubmitting(true);
      const response = await serviceService.createService(data);
      setServices((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar serviço",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateService = async (id: number, data: UpdateServiceData) => {
    try {
      setSubmitting(true);
      const response = await serviceService.updateService(id, data);
      setServices((prev) =>
        prev.map((service) => (service.id === id ? response.data : service))
      );
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id: number) => {
    try {
      setSubmitting(true);
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      setSubmitting(true);
      const response = service.isActive
        ? await serviceService.deactivateService(service.id)
        : await serviceService.activateService(service.id);

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? response.data : s))
      );

      toast({
        title: "Sucesso",
        description: `Serviço ${
          service.isActive ? "desativado" : "ativado"
        } com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do serviço",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    submitting,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
  };
};
