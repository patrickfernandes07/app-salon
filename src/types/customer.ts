// src/types/customer.ts
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export type UpdateCustomerData = CreateCustomerData;

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
}
