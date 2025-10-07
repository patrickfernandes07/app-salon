// src/services/reportService.ts
import { apiService } from "./api";
import {
  FinancialDashboard,
  FinancialReport,
  AppointmentReport,
  CustomerReport,
  ProfessionalPerformance,
  DashboardSummary,
} from "@/types/report";

class ReportService {
  private readonly baseUrl = "/reports";

  async getFinancialDashboard(
    companyId: number,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    params.append("companyId", companyId.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return apiService.get<FinancialDashboard>(
      `${this.baseUrl}/financial/dashboard?${params.toString()}`
    );
  }

  async getFinancialReport(
    startDate: string,
    endDate: string,
    companyId?: number
  ) {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("endDate", endDate);
    if (companyId) params.append("companyId", companyId.toString());

    return apiService.get<FinancialReport>(
      `${this.baseUrl}/financial?${params.toString()}`
    );
  }

  async getAppointmentReport(
    startDate: string,
    endDate: string,
    companyId?: number
  ) {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("endDate", endDate);
    if (companyId) params.append("companyId", companyId.toString());

    return apiService.get<AppointmentReport>(
      `${this.baseUrl}/appointments?${params.toString()}`
    );
  }

  async getCustomerReport(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId.toString());

    const finalUrl = params.toString()
      ? `${this.baseUrl}/customers?${params.toString()}`
      : `${this.baseUrl}/customers`;

    return apiService.get<CustomerReport>(finalUrl);
  }

  async getProfessionalPerformance(
    professionalId: number,
    startDate: string,
    endDate: string
  ) {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("endDate", endDate);

    return apiService.get<ProfessionalPerformance>(
      `${
        this.baseUrl
      }/professionals/${professionalId}/performance?${params.toString()}`
    );
  }

  async getDashboardSummary(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId.toString());

    const finalUrl = params.toString()
      ? `${this.baseUrl}/dashboard?${params.toString()}`
      : `${this.baseUrl}/dashboard`;

    return apiService.get<DashboardSummary>(finalUrl);
  }
}

export const reportService = new ReportService();
export default reportService;
