// src/types/transaction.ts
export interface Transaction {
  id: number;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  installments: number;
  currentInstallment: number;
  dueDate?: string;
  paidAt?: string;
  status: TransactionStatus;
  companyId: number;
  professionalId?: number;
  appointmentId?: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum TransactionCategory {
  SERVICE_PAYMENT = "SERVICE_PAYMENT",
  PRODUCT_SALE = "PRODUCT_SALE",
  COMMISSION = "COMMISSION",
  SALARY = "SALARY",
  RENT = "RENT",
  UTILITIES = "UTILITIES",
  SUPPLIES = "SUPPLIES",
  MARKETING = "MARKETING",
  EQUIPMENT = "EQUIPMENT",
  OTHER = "OTHER",
}

export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PIX = "PIX",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHECK = "CHECK",
  OTHER = "OTHER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export const TransactionTypeLabels = {
  [TransactionType.INCOME]: "Receita",
  [TransactionType.EXPENSE]: "Despesa",
};

export const TransactionCategoryLabels = {
  [TransactionCategory.SERVICE_PAYMENT]: "Pagamento de Serviço",
  [TransactionCategory.PRODUCT_SALE]: "Venda de Produto",
  [TransactionCategory.COMMISSION]: "Comissão",
  [TransactionCategory.SALARY]: "Salário",
  [TransactionCategory.RENT]: "Aluguel",
  [TransactionCategory.UTILITIES]: "Contas (água, luz, etc.)",
  [TransactionCategory.SUPPLIES]: "Suprimentos",
  [TransactionCategory.MARKETING]: "Marketing",
  [TransactionCategory.EQUIPMENT]: "Equipamentos",
  [TransactionCategory.OTHER]: "Outros",
};

export const PaymentMethodLabels = {
  [PaymentMethod.CASH]: "Dinheiro",
  [PaymentMethod.CREDIT_CARD]: "Cartão de Crédito",
  [PaymentMethod.DEBIT_CARD]: "Cartão de Débito",
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.BANK_TRANSFER]: "Transferência Bancária",
  [PaymentMethod.CHECK]: "Cheque",
  [PaymentMethod.OTHER]: "Outros",
};

export const TransactionStatusLabels = {
  [TransactionStatus.PENDING]: "Pendente",
  [TransactionStatus.PAID]: "Pago",
  [TransactionStatus.OVERDUE]: "Vencido",
  [TransactionStatus.CANCELLED]: "Cancelado",
};

export interface CreateTransactionData {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  dueDate?: string;
  companyId: number;
  professionalId?: number;
  appointmentId?: number;
}

export type UpdateTransactionData = Partial<CreateTransactionData>;

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    pendingIncomePayments: number;  
    pendingExpensePayments: number;  
    overdueTotal: number;
    paidTransactions: number;
    totalTransactions : number;
  };
  categoryBreakdown: Array<{
    category: string;
    type: string;
    total: number;
    count: number;
  }>;
}
