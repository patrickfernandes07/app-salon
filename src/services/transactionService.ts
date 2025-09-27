// src/services/transactionService.ts
import { apiService } from "./api";
import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  TransactionStatus,
  FinancialSummary,
} from "@/types/transaction";

class TransactionService {
  private readonly baseUrl = "/transactions";

  async getTransactions(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}?${params.toString()}`
      : this.baseUrl;

    return apiService.get<Transaction[]>(finalUrl);
  }

  async getPendingTransactions(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/pending?${params.toString()}`
      : `${this.baseUrl}/pending`;

    return apiService.get<Transaction[]>(finalUrl);
  }

  async getOverdueTransactions(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/overdue?${params.toString()}`
      : `${this.baseUrl}/overdue`;

    return apiService.get<Transaction[]>(finalUrl);
  }

  async getTransactionById(id: number) {
    return apiService.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  async createTransaction(data: CreateTransactionData) {
    return apiService.post<Transaction>(this.baseUrl, data);
  }

  async updateTransaction(id: number, data: UpdateTransactionData) {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}`, data);
  }

  async deleteTransaction(id: number) {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async markAsPaid(id: number) {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}/pay`);
  }

  async cancelTransaction(id: number) {
    return apiService.patch<Transaction>(`${this.baseUrl}/${id}/cancel`);
  }

  async getTransactionsByType(type: TransactionType, companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/type/${type}?${params.toString()}`
      : `${this.baseUrl}/type/${type}`;

    return apiService.get<Transaction[]>(finalUrl);
  }

  async getTransactionsByCategory(
    category: TransactionCategory,
    companyId?: number
  ) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/category/${category}?${params.toString()}`
      : `${this.baseUrl}/category/${category}`;

    return apiService.get<Transaction[]>(finalUrl);
  }

  async getTransactionsByCompany(companyId: number) {
    return apiService.get<Transaction[]>(
      `${this.baseUrl}/company/${companyId}`
    );
  }

  async getTransactionsByProfessional(professionalId: number) {
    return apiService.get<Transaction[]>(
      `${this.baseUrl}/professional/${professionalId}`
    );
  }

  async getTransactionsByAppointment(appointmentId: number) {
    return apiService.get<Transaction[]>(
      `${this.baseUrl}/appointment/${appointmentId}`
    );
  }

  async getFinancialSummary(
    companyId?: number,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/reports/summary?${params.toString()}`
      : `${this.baseUrl}/reports/summary`;

    return apiService.get<FinancialSummary>(finalUrl);
  }

  async getTypes() {
    return apiService.get<TransactionType[]>(`${this.baseUrl}/types`);
  }

  async getCategories() {
    return apiService.get<TransactionCategory[]>(`${this.baseUrl}/categories`);
  }

  async getPaymentMethods() {
    return apiService.get<PaymentMethod[]>(`${this.baseUrl}/payment-methods`);
  }

  async getStatuses() {
    return apiService.get<TransactionStatus[]>(`${this.baseUrl}/statuses`);
  }

  async searchTransactions(searchDto: any) {
    const params = new URLSearchParams();
    Object.keys(searchDto).forEach((key) => {
      if (searchDto[key] !== undefined && searchDto[key] !== null) {
        params.append(key, searchDto[key].toString());
      }
    });

    const finalUrl = `${this.baseUrl}/search?${params.toString()}`;
    return apiService.get<Transaction[]>(finalUrl);
  }
}

export const transactionService = new TransactionService();
export default transactionService;
