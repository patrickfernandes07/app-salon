/**
 * Formata um valor numérico para o padrão monetário brasileiro (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (R$ 1.234,56)
 */
export function formatCurrency(
  value: number | string | null | undefined
): string {
  // Converte para número, tratando casos null/undefined
  const numValue = typeof value === "string" ? parseFloat(value) : value ?? 0;

  // Retorna formatado no padrão brasileiro
  return numValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata um valor numérico sem o símbolo da moeda
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (1.234,56)
 */
export function formatNumber(
  value: number | string | null | undefined
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value ?? 0;

  return numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
