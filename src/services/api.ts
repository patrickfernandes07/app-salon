// src/services/api.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private readonly baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 100000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - adiciona token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - lida com refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!this.isAxiosError(error)) {
          return Promise.reject(error);
        }

        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
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
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
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

  // Type guard para verificar se é um AxiosError
  private isAxiosError(error: unknown): error is import("axios").AxiosError {
    return axios.isAxiosError(error);
  }

  // Métodos públicos para requisições
  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get<T>(url, config);
    return this.handleResponse(response);
  }

  public async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.patch<T>(url, data, config);
    return this.handleResponse(response);
  }

  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete<T>(url, config);
    return this.handleResponse(response);
  }

  // Métodos de autenticação
  private async refreshAccessToken(): Promise<
    AxiosResponse<RefreshTokenResponse>
  > {
    const refreshToken = this.getRefreshToken();
    const requestData: RefreshTokenRequest = { refreshToken: refreshToken! };
    return this.api.post<RefreshTokenResponse>("/auth/refresh", requestData);
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
