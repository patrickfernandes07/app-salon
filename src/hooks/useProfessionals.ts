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

  const createProfessional = async (data: CreateProfessionalData) => {
    try {
      setSubmitting(true);
      const response = await professionalService.createProfessional(data);
      setProfessionals((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Profissional criado com sucesso",
      });
      return response.data;
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
    data: UpdateProfessionalData
  ) => {
    try {
      setSubmitting(true);
      const response = await professionalService.updateProfessional(id, data);
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
