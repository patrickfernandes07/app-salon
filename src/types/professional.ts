// src/types/professional.ts
export interface Professional {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  specialty?: string;
  commission: number;
  isActive: boolean;
  hireDate?: string;
  bio?: string;
  instagram?: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalData {
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  commission: number;
  hireDate?: string;
  bio?: string;
  instagram?: string;
  companyId: number;
}

export type UpdateProfessionalData = Partial<CreateProfessionalData>;

export interface ProfessionalFilters {
  search?: string;
  specialty?: string;
  isActive?: boolean;
}
