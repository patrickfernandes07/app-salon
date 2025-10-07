// src/types/user.ts
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  companyId: number;
  professionalId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  companyId: number;
  professionalId?: number;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  professionalId?: number;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}
