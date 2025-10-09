// src/types/service.ts
export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number; // Duração em minutos
  category: ServiceCategory;
  isActive: boolean;
  color?: string; // Cor para exibição no calendário
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export enum ServiceCategory {
  HAIR = "HAIR",
  BEARD = "BEARD",
  NAILS = "NAILS",
  EYEBROWS = "EYEBROWS",
  MASSAGE = "MASSAGE",
  FACIAL = "FACIAL",
  DEPILATION = "DEPILATION",
  OTHER = "OTHER",
}

export const ServiceCategoryLabels = {
  [ServiceCategory.HAIR]: "Cabelo",
  [ServiceCategory.BEARD]: "Barba",
  [ServiceCategory.NAILS]: "Unhas",
  [ServiceCategory.EYEBROWS]: "Sobrancelhas",
  [ServiceCategory.MASSAGE]: "Massagem",
  [ServiceCategory.FACIAL]: "Facial",
  [ServiceCategory.DEPILATION]: "Depilação",
  [ServiceCategory.OTHER]: "Outros",
};

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: ServiceCategory;
  color?: string;
  companyId: number;
}

export type UpdateServiceData = Partial<CreateServiceData>;

export interface ServiceFilters {
  search?: string;
  category?: ServiceCategory;
  isActive?: boolean;
}

export interface ProfessionalService {
  id: number;
  professionalId: number;
  serviceId: number;
  customPrice?: number;
  service?: Service;
}
