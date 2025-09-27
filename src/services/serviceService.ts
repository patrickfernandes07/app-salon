// src/services/serviceService.ts
import {
  CreateServiceData,
  Service,
  ServiceCategory,
  UpdateServiceData,
} from "@/types/service";
import { apiService } from "./api";

class ServiceService {
  private readonly baseUrl = "/services";

  async getServices(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}?${params.toString()}`
      : this.baseUrl;

    return apiService.get<Service[]>(finalUrl);
  }

  async getActiveServices(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/active?${params.toString()}`
      : `${this.baseUrl}/active`;

    return apiService.get<Service[]>(finalUrl);
  }

  async getServiceById(id: number) {
    return apiService.get<Service>(`${this.baseUrl}/${id}`);
  }

  async createService(data: CreateServiceData) {
    return apiService.post<Service>(this.baseUrl, data);
  }

  async updateService(id: number, data: UpdateServiceData) {
    return apiService.patch<Service>(`${this.baseUrl}/${id}`, data);
  }

  async deleteService(id: number) {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async activateService(id: number) {
    return apiService.patch<Service>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateService(id: number) {
    return apiService.patch<Service>(`${this.baseUrl}/${id}/deactivate`);
  }

  async getServicesByCategory(category: ServiceCategory, companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/category/${category}?${params.toString()}`
      : `${this.baseUrl}/category/${category}`;

    return apiService.get<Service[]>(finalUrl);
  }

  async getServicesByCompany(companyId: number) {
    return apiService.get<Service[]>(`${this.baseUrl}/company/${companyId}`);
  }

  async getServicesByProfessional(professionalId: number) {
    return apiService.get<Service[]>(
      `${this.baseUrl}/professional/${professionalId}`
    );
  }

  async getServiceStats(id: number) {
    return apiService.get(`${this.baseUrl}/${id}/stats`);
  }

  async getCategories() {
    return apiService.get<ServiceCategory[]>(`${this.baseUrl}/categories`);
  }

  async searchServices(query: string) {
    return apiService.get<Service[]>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
  }
}

export const serviceService = new ServiceService();
export default serviceService;
