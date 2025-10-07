// src/services/professionalService.ts
import { apiService } from "./api";
import {
  Professional,
  CreateProfessionalData,
  UpdateProfessionalData,
} from "@/types/professional";

class ProfessionalService {
  private readonly baseUrl = "/professionals";

  async getProfessionals(companyId?: number) {
    if (companyId) {
      const params = new URLSearchParams();
      params.append("companyId", companyId.toString());
      return apiService.get<Professional[]>(
        `${this.baseUrl}?${params.toString()}`
      );
    }
    return apiService.get<Professional[]>(this.baseUrl);
  }

  async getActiveProfessionals(companyId?: number) {
    if (companyId) {
      const params = new URLSearchParams();
      params.append("companyId", companyId.toString());
      return apiService.get<Professional[]>(
        `${this.baseUrl}/active?${params.toString()}`
      );
    }
    return apiService.get<Professional[]>(`${this.baseUrl}/active`);
  }

  async getProfessionalsByCompany(companyId: number) {
    return apiService.get<Professional[]>(
      `${this.baseUrl}/company/${companyId}`
    );
  }

  async getProfessionalById(id: number) {
    return apiService.get<Professional>(`${this.baseUrl}/${id}`);
  }

  async getProfessionalServices(id: number) {
    return apiService.get(`${this.baseUrl}/${id}/services`);
  }

  async createProfessional(data: CreateProfessionalData) {
    return apiService.post<Professional>(this.baseUrl, data);
  }

  async updateProfessional(id: number, data: UpdateProfessionalData) {
    return apiService.patch<Professional>(`${this.baseUrl}/${id}`, data);
  }

  async deleteProfessional(id: number) {
    return apiService.delete<Professional>(`${this.baseUrl}/${id}`);
  }

  async activateProfessional(id: number) {
    return apiService.patch<Professional>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateProfessional(id: number) {
    return apiService.patch<Professional>(`${this.baseUrl}/${id}/deactivate`);
  }

  async assignService(
    professionalId: number,
    serviceId: number,
    customPrice?: number
  ) {
    return apiService.post(`${this.baseUrl}/${professionalId}/services`, {
      serviceId,
      customPrice,
    });
  }

  async removeService(professionalId: number, serviceId: number) {
    return apiService.delete(
      `${this.baseUrl}/${professionalId}/services/${serviceId}`
    );
  }
}

export const professionalService = new ProfessionalService();
export default professionalService;
