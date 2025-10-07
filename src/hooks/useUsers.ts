// src/hooks/useUsers.ts
"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { User, CreateUserData, UpdateUserData } from "@/types/user";
import { toast } from "@/components/ui/use-toast";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(1); // provisorio
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserData) => {
    try {
      setSubmitting(true);
      const response = await userService.createUser(data);
      setUsers((prev) => [...prev, response.data]);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateUser = async (id: number, data: UpdateUserData) => {
    try {
      setSubmitting(true);
      const response = await userService.updateUser(id, data);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? response.data : user))
      );
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setSubmitting(true);
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      setSubmitting(true);
      const response = user.isActive
        ? await userService.deactivateUser(user.id)
        : await userService.activateUser(user.id);

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? response.data : u))
      );

      toast({
        title: "Sucesso",
        description: `Usuário ${
          user.isActive ? "desativado" : "ativado"
        } com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    submitting,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};
