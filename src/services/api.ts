// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private readonly baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - lida com refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              this.redirectToLogin();
              return Promise.reject(error);
            }

            const response = await this.refreshAccessToken();
            const { accessToken } = response.data;

            this.setAccessToken(accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            this.redirectToLogin();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos públicos para requisições
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get<T>(url, config);
    return this.handleResponse(response);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.patch<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete<T>(url, config);
    return this.handleResponse(response);
  }

  // Métodos de autenticação
  private async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    return this.api.post("/auth/refresh", { refreshToken });
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      success: true,
    };
  }

  // Gerenciamento de tokens
  private getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("accessToken");
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("refreshToken");
    }
    return null;
  }

  public setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("accessToken", token);
    }
  }

  public setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("refreshToken", token);
    }
  }

  public clearTokens(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private redirectToLogin(): void {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;
