// src/hooks/useCompanySettings.ts
"use client";

import { useState, useEffect } from "react";
import { companyService } from "@/services/companyService";
import { Company, UpdateCompanyData } from "@/types/company";
import { toast } from "@/components/ui/use-toast";

export const useCompanySettings = (companyId: number) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanyById(companyId);
      setCompany(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar informações da empresa",
        variant: "destructive",
      });
      console.error("Erro ao buscar empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: UpdateCompanyData) => {
    try {
      setSubmitting(true);
      const response = await companyService.updateCompany(companyId, data);
      setCompany(response.data);
      toast({
        title: "Sucesso",
        description: "Informações da empresa atualizadas com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      setSubmitting(true);
      const response = await companyService.uploadLogo(companyId, file);
      setCompany(response.data);
      toast({
        title: "Sucesso",
        description: "Logo atualizada com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  return {
    company,
    loading,
    submitting,
    fetchCompany,
    updateCompany,
    uploadLogo,
  };
};
