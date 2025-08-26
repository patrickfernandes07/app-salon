// src/services/customerService.ts
import { apiService } from "./api";
import {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
} from "@/types/customer";

class CustomerService {
  private readonly baseUrl = "/customers";

  async getCustomers(companyId: number) {
    const params = new URLSearchParams();
    if (!companyId) {
      // provisorio
      companyId = 1;
    }
    params.append("companyId", companyId.toString());

    const finalUrl = `${this.baseUrl}?${params.toString()}`;
    return apiService.get<Customer[]>(finalUrl);
  }

  async getCustomerById(id: number) {
    return apiService.get<Customer>(`${this.baseUrl}/${id}`);
  }

  async createCustomer(data: CreateCustomerData) {
    return apiService.post<Customer>(this.baseUrl, data);
  }

  async updateCustomer(id: number, data: UpdateCustomerData) {
    return apiService.patch<Customer>(`${this.baseUrl}/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async activateCustomer(id: number) {
    return apiService.patch<Customer>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateCustomer(id: number) {
    return apiService.patch<Customer>(`${this.baseUrl}/${id}/deactivate`);
  }

  async searchCustomers(query: string) {
    return apiService.get<Customer[]>(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
  }

  async getCustomerHistory(id: number) {
    return apiService.get(`${this.baseUrl}/${id}/history`);
  }
}

export const customerService = new CustomerService();
export default customerService;
