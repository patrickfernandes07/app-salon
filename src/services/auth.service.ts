// src/services/auth.service.ts
import apiService from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Interface para erros da API
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Type guard para verificar se é um erro da API
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
}

class AuthService {
  private readonly USER_KEY = "user";

  // Login do usuário
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Salvar tokens
        apiService.setAccessToken(accessToken);
        apiService.setRefreshToken(refreshToken);

        // Salvar dados do usuário
        this.setUser(user);

        return response.data;
      }

      throw new Error("Resposta inválida do servidor");
    } catch (error: unknown) {
      console.error("Erro no login:", error);

      if (isApiError(error)) {
        throw new Error(error.response?.data?.message || "Erro ao fazer login");
      }

      throw new Error("Erro ao fazer login");
    }
  }

  // Logout do usuário
  async logout(): Promise<void> {
    try {
      // Limpar tokens e dados do usuário
      apiService.clearTokens();
      this.clearUser();

      // Redirecionar para login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error: unknown) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, limpar dados locais
      apiService.clearTokens();
      this.clearUser();
    }
  }

  // Refresh do token
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
      }

      const response = await apiService.post<RefreshTokenResponse>(
        "/auth/refresh",
        {
          refreshToken,
        }
      );

      if (response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Atualizar tokens
        apiService.setAccessToken(accessToken);
        apiService.setRefreshToken(newRefreshToken);

        return response.data;
      }

      throw new Error("Resposta inválida do servidor");
    } catch (error: unknown) {
      console.error("Erro ao renovar token:", error);

      if (isApiError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro ao renovar sessão"
        );
      }

      throw new Error("Erro ao renovar sessão");
    }
  }

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>("/users/me");

      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }

      throw new Error("Usuário não encontrado");
    } catch (error: unknown) {
      console.error("Erro ao obter usuário atual:", error);

      if (isApiError(error)) {
        throw new Error(
          error.response?.data?.message || "Erro ao obter dados do usuário"
        );
      }

      throw new Error("Erro ao obter dados do usuário");
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return apiService.isAuthenticated() && !!this.getUser();
  }

  // Gerenciamento de dados do usuário
  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr) as User;
        } catch (error: unknown) {
          console.error("Erro ao parsear dados do usuário:", error);
          this.clearUser();
        }
      }
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  clearUser(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  // Métodos auxiliares
  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("refreshToken");
    }
    return null;
  }

  // Verificar permissões
  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(["ADMIN", "SUPER_ADMIN"]);
  }

  isManager(): boolean {
    return this.hasRole(["MANAGER", "ADMIN", "SUPER_ADMIN"]);
  }

  canManage(): boolean {
    return this.hasRole(["MANAGER", "ADMIN", "SUPER_ADMIN"]);
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
