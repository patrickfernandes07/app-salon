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

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append("logo", file);

    return apiService.post<{ message: string; url: string }>(
      `${this.baseUrl}/upload-logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

export const companyService = new CompanyService();
export default companyService;
