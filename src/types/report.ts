// src/types/report.ts

export interface FinancialDashboard {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  revenueGrowth: number;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalAppointments: number;
    averageTicket: number;
    completionRate: number;
    topServices: TopService[];
  };
  revenueBreakdown: {
    appointments: number;
    otherIncome: number;
  };
  expensesBreakdown: ExpenseCategory[];
  comparison: {
    previousPeriod: {
      start: string;
      end: string;
      revenue: number;
    };
    growth: {
      revenue: number;
    };
  };
}

export interface TopService {
  serviceId: number;
  serviceName: string;
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  appointmentsCount: number;
}

export interface ExpenseCategory {
  category: string;
  totalAmount: number;
  totalTransactions: number;
}

export interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    byProfessional: ProfessionalRevenue[];
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  balance: number;
  pending: {
    income: number;
    expense: number;
  };
  overdue: {
    income: number;
    expense: number;
  };
}

export interface ProfessionalRevenue {
  professionalId: number;
  name: string;
  amount: number;
}

export interface AppointmentReport {
  period: {
    startDate: string;
    endDate: string;
  };
  total: number;
  byStatus: Record<string, number>;
  byProfessional: ProfessionalAppointments[];
  averageTicket: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
}

export interface ProfessionalAppointments {
  professionalId: number;
  name: string;
  count: number;
  revenue: number;
}

export interface CustomerReport {
  total: number;
  active: number;
  inactive: number;
  newCustomers: number;
  topCustomers: TopCustomer[];
  averageTicket: number;
}

export interface TopCustomer {
  customerId: number;
  name: string;
  appointmentsCount: number;
  totalSpent: number;
}

export interface ProfessionalPerformance {
  professionalId: number;
  name: string;
  period: {
    startDate: string;
    endDate: string;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  revenue: {
    total: number;
    average: number;
  };
  commission: {
    total: number;
    paid: number;
    pending: number;
  };
  completionRate: number;
}

export interface DashboardSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  financial: {
    revenue: number;
    expenses: number;
    balance: number;
    pending: number;
  };
  appointments: {
    total: number;
    completed: number;
    today: number;
    averageTicket: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
  };
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
