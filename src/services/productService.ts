// src/services/productService.ts
import { apiService } from "./api";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductCategory,
} from "@/types/product";

class ProductService {
  private readonly baseUrl = "/products";

  async getProducts(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}?${params.toString()}`
      : this.baseUrl;

    return apiService.get<Product[]>(finalUrl);
  }

  async getActiveProducts(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/active?${params.toString()}`
      : `${this.baseUrl}/active`;

    return apiService.get<Product[]>(finalUrl);
  }

  async getLowStockProducts(companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/low-stock?${params.toString()}`
      : `${this.baseUrl}/low-stock`;

    return apiService.get<Product[]>(finalUrl);
  }

  async getProductById(id: number) {
    return apiService.get<Product>(`${this.baseUrl}/${id}`);
  }

  async getProductByBarcode(barcode: string) {
    return apiService.get<Product>(`${this.baseUrl}/barcode/${barcode}`);
  }

  async createProduct(data: CreateProductData) {
    return apiService.post<Product>(this.baseUrl, data);
  }

  async updateProduct(id: number, data: UpdateProductData) {
    return apiService.patch<Product>(`${this.baseUrl}/${id}`, data);
  }

  async deleteProduct(id: number) {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async activateProduct(id: number) {
    return apiService.patch<Product>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateProduct(id: number) {
    return apiService.patch<Product>(`${this.baseUrl}/${id}/deactivate`);
  }

  async getProductsByCategory(category: ProductCategory, companyId?: number) {
    const params = new URLSearchParams();
    if (companyId) {
      params.append("companyId", companyId.toString());
    }

    const finalUrl = params.toString()
      ? `${this.baseUrl}/category/${category}?${params.toString()}`
      : `${this.baseUrl}/category/${category}`;

    return apiService.get<Product[]>(finalUrl);
  }

  async getProductsByCompany(companyId: number) {
    return apiService.get<Product[]>(`${this.baseUrl}/company/${companyId}`);
  }

  async getProductStats(id: number) {
    return apiService.get(`${this.baseUrl}/${id}/stats`);
  }

  async getCategories() {
    return apiService.get<ProductCategory[]>(`${this.baseUrl}/categories`);
  }

  async searchProducts(searchDto: any) {
    const params = new URLSearchParams();
    Object.keys(searchDto).forEach((key) => {
      if (searchDto[key] !== undefined && searchDto[key] !== null) {
        params.append(key, searchDto[key].toString());
      }
    });

    const finalUrl = `${this.baseUrl}/search?${params.toString()}`;
    return apiService.get<Product[]>(finalUrl);
  }

  // Atualização de estoque simples baseada no controller
  async updateStock(id: number, stock: number) {
    return apiService.patch<Product>(`${this.baseUrl}/${id}/stock`, {
      stock,
    });
  }
}

export const productService = new ProductService();
export default productService;
