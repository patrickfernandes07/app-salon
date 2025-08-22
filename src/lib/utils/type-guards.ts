// src/lib/utils/type-guards.ts

// Tipo local para Decimal do Prisma
interface PrismaDecimal {
  s: number;
  e: number;
  d: number[];
}

export const isNumber = (value: any): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const isPrismaDecimal = (value: any): value is PrismaDecimal => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.s === "number" &&
    typeof value.e === "number" &&
    Array.isArray(value.d)
  );
};

// Converte Decimal do Prisma para number
export const decimalToNumber = (decimal: PrismaDecimal): number => {
  const sign = decimal.s;
  const exponent = decimal.e;
  const digits = decimal.d;

  // Converte os dígitos em string
  let numStr = digits.join("");

  // No Decimal.js, o expoente representa a posição do primeiro dígito significativo
  // Se e = 1 e d = [40], significa 40 (não 400)
  // Se e = 2 e d = [40], significa 400
  // Se e = 0 e d = [40], significa 4.0
  // Se e = -1 e d = [40], significa 0.40

  const totalDigits = numStr.length;
  const decimalPosition = exponent + 1;

  if (decimalPosition <= 0) {
    // Número menor que 1 (0.xxx)
    numStr = "0." + "0".repeat(Math.abs(decimalPosition)) + numStr;
  } else if (decimalPosition >= totalDigits) {
    // Número inteiro com zeros à direita
    numStr = numStr + "0".repeat(decimalPosition - totalDigits);
  } else {
    // Número com casas decimais
    numStr =
      numStr.slice(0, decimalPosition) + "." + numStr.slice(decimalPosition);
  }

  const result = parseFloat(numStr);
  return sign === -1 ? -result : result;
};

export const safeToFixed = (value: any, decimals: number = 2): string => {
  if (isNumber(value)) {
    return value.toFixed(decimals);
  }

  if (isPrismaDecimal(value)) {
    return decimalToNumber(value).toFixed(decimals);
  }

  // Tenta converter string para número
  if (typeof value === "string") {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toFixed(decimals);
    }
  }

  return (0).toFixed(decimals);
};

export const safeNumber = (value: any): number => {
  if (isNumber(value)) {
    return value;
  }

  if (isPrismaDecimal(value)) {
    return decimalToNumber(value);
  }

  // Tenta converter string para número
  if (typeof value === "string") {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num;
    }
  }

  return 0;
};
