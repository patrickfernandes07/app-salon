// src/lib/utils/number.ts
/**
 * Utilitários para formatação de números e valores monetários
 */

export const formatCurrency = (value: any): string => {
  const numValue = Number(value || 0);
  return numValue.toFixed(2);
};

export const formatCurrencyBRL = (value: any): string => {
  const numValue = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
};

export const ensureNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const calculatePercentage = (value: any, percentage: any): number => {
  const numValue = ensureNumber(value);
  const numPercentage = ensureNumber(percentage);
  return (numValue * numPercentage) / 100;
};

export const calculateDiscount = (
  value: any,
  discountPercentage: any
): number => {
  const numValue = ensureNumber(value);
  const discount = calculatePercentage(numValue, discountPercentage);
  return Math.max(0, numValue - discount);
};
