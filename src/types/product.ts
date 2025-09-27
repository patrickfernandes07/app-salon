// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  description?: string;
  barcode?: string;
  brand?: string;
  category: ProductCategory;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number; // Estoque mínimo para alerta
  unit: string; // UN, L, ML, KG, G
  isActive: boolean;
  image?: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProductCategory {
  SHAMPOO = "SHAMPOO",
  CONDITIONER = "CONDITIONER",
  HAIR_STYLING = "HAIR_STYLING", // Produtos para cabelo
  BEARD_CARE = "BEARD_CARE", // Cuidados com barba
  NAIL_CARE = "NAIL_CARE", // Cuidados com unhas
  FACIAL_CARE = "FACIAL_CARE", // Cuidados faciais
  TOOLS = "TOOLS", // Ferramentas
  ACCESSORIES = "ACCESSORIES", // Acessórios
  OTHER = "OTHER",
}

export const ProductCategoryLabels = {
  [ProductCategory.SHAMPOO]: "Shampoo",
  [ProductCategory.CONDITIONER]: "Condicionador",
  [ProductCategory.HAIR_STYLING]: "Produtos para Cabelo",
  [ProductCategory.BEARD_CARE]: "Cuidados com Barba",
  [ProductCategory.NAIL_CARE]: "Cuidados com Unhas",
  [ProductCategory.FACIAL_CARE]: "Cuidados Faciais",
  [ProductCategory.TOOLS]: "Ferramentas",
  [ProductCategory.ACCESSORIES]: "Acessórios",
  [ProductCategory.OTHER]: "Outros",
};

export const ProductUnits = [
  { value: "UN", label: "Unidade" },
  { value: "L", label: "Litro" },
  { value: "ML", label: "Mililitro" },
  { value: "KG", label: "Quilograma" },
  { value: "G", label: "Grama" },
];

export interface CreateProductData {
  name: string;
  description?: string;
  barcode?: string;
  brand?: string;
  category: ProductCategory;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  companyId: number;
}

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  isActive?: boolean;
  lowStock?: boolean;
}
