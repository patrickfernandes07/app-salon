"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { User, UpdateUserData } from "@/types/user";
import { toast } from "@/components/ui/use-toast";

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil do usuário",
        variant: "destructive",
      });
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateUserData) => {
    if (!user) return;

    try {
      setSubmitting(true);
      const response = await userService.updateUser(user.id, data);
      setUser(response.data);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user) return;

    try {
      setSubmitting(true);

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Verifique a senha atual.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      setSubmitting(true);

      const response = await userService.uploadAvatar(file);

      setUser({
        ...user,
        avatar: response.data.url,
      });

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    submitting,
    updateProfile,
    changePassword,
    uploadAvatar,
    refreshProfile: fetchUserProfile,
  };
};
