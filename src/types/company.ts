// src/types/company.ts
export type Plan = "BASIC" | "PREMIUM" | "ENTERPRISE";

export interface Company {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
  plan: Plan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
}
