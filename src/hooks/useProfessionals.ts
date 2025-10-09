// src/hooks/useProfessionals.ts
"use client";

import { useState, useEffect } from "react";
import { professionalService } from "@/services/professionalService";
import {
  Professional,
  CreateProfessionalData,
  UpdateProfessionalData,
} from "@/types/professional";
import { toast } from "@/components/ui/use-toast";

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await professionalService.getProfessionals(1); // provisorio
      setProfessionals(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais",
        variant: "destructive",
      });
      console.error("Erro ao buscar profissionais:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfessional = async (
    data: CreateProfessionalData & { serviceIds?: number[] }
  ) => {
    try {
      setSubmitting(true);

      // Separar serviceIds dos dados do profissional
      const { serviceIds, ...professionalData } = data;

      // Criar o profissional
      const response = await professionalService.createProfessional(
        professionalData
      );
      const newProfessional = response.data;

      // Atribuir serviços se houver
      if (serviceIds && serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          try {
            await professionalService.assignService(
              newProfessional.id,
              serviceId
            );
          } catch (error) {
            console.error(`Erro ao atribuir serviço ${serviceId}:`, error);
          }
        }
      }

      setProfessionals((prev) => [...prev, newProfessional]);
      toast({
        title: "Sucesso",
        description: "Profissional criado com sucesso",
      });
      return newProfessional;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar profissional",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProfessional = async (
    id: number,
    data: UpdateProfessionalData & { serviceIds?: number[] }
  ) => {
    try {
      setSubmitting(true);

      // Separar serviceIds dos dados do profissional
      const { serviceIds, ...professionalData } = data;

      // Atualizar os dados do profissional
      const response = await professionalService.updateProfessional(
        id,
        professionalData
      );

      // Atualizar serviços se fornecidos
      if (serviceIds !== undefined) {
        // Buscar serviços atuais
        const currentResponse =
          await professionalService.getProfessionalServices(id);
        const currentServiceIds = currentResponse.data.map(
          (ps: any) => ps.serviceId
        );

        // Serviços para adicionar
        const toAdd = serviceIds.filter(
          (serviceId: number) => !currentServiceIds.includes(serviceId)
        );

        // Serviços para remover
        const toRemove = currentServiceIds.filter(
          (serviceId: number) => !serviceIds.includes(serviceId)
        );

        // Adicionar novos serviços
        for (const serviceId of toAdd) {
          try {
            await professionalService.assignService(id, serviceId);
          } catch (error) {
            console.error(`Erro ao adicionar serviço ${serviceId}:`, error);
          }
        }

        // Remover serviços
        for (const serviceId of toRemove) {
          try {
            await professionalService.removeService(id, serviceId);
          } catch (error) {
            console.error(`Erro ao remover serviço ${serviceId}:`, error);
          }
        }
      }

      setProfessionals((prev) =>
        prev.map((professional) =>
          professional.id === id ? response.data : professional
        )
      );

      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar profissional",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProfessional = async (id: number) => {
    try {
      setSubmitting(true);
      await professionalService.deleteProfessional(id);
      setProfessionals((prev) =>
        prev.filter((professional) => professional.id !== id)
      );
      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir profissional",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProfessionalStatus = async (professional: Professional) => {
    try {
      setSubmitting(true);
      const response = professional.isActive
        ? await professionalService.deactivateProfessional(professional.id)
        : await professionalService.activateProfessional(professional.id);

      setProfessionals((prev) =>
        prev.map((p) => (p.id === professional.id ? response.data : p))
      );

      toast({
        title: "Sucesso",
        description: `Profissional ${
          professional.isActive ? "desativado" : "ativado"
        } com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do profissional",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    loading,
    submitting,
    fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    toggleProfessionalStatus,
  };
};
