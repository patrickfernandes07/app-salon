// src/services/companyService.ts
import { apiService } from "./api";
import { Company, UpdateCompanyData } from "@/types/company";

class CompanyService {
  private readonly baseUrl = "/companies";

  async getCompanyById(id: number) {
    return apiService.get<Company>(`${this.baseUrl}/${id}`);
  }

  async updateCompany(id: number, data: UpdateCompanyData) {
    return apiService.patch<Company>(`${this.baseUrl}/${id}`, data);
  }

  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append("logo", file);

    // Você precisará ajustar isso se tiver um endpoint específico para upload
    return apiService.patch<Company>(`${this.baseUrl}/${id}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export const companyService = new CompanyService();
export default companyService;
