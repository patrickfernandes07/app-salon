// src/lib/utils/number.ts
/**
 * Utilitários para formatação de números e valores monetários
 */

// Tipo para valores que podem ser convertidos em número
type NumericValue = string | number | null | undefined;

export const formatCurrency = (value: NumericValue): string => {
  const numValue = Number(value || 0);
  return numValue.toFixed(2);
};

export const formatCurrencyBRL = (value: NumericValue): string => {
  const numValue = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
};

export const ensureNumber = (value: NumericValue): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const calculatePercentage = (
  value: NumericValue,
  percentage: NumericValue
): number => {
  const numValue = ensureNumber(value);
  const numPercentage = ensureNumber(percentage);
  return (numValue * numPercentage) / 100;
};

export const calculateDiscount = (
  value: NumericValue,
  discountPercentage: NumericValue
): number => {
  const numValue = ensureNumber(value);
  const discount = calculatePercentage(numValue, discountPercentage);
  return Math.max(0, numValue - discount);
};
