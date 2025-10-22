import { apiService } from "./api";
import { User, CreateUserData, UpdateUserData } from "@/types/user";

class UserService {
  private readonly baseUrl = "/users";

  async getUsers(companyId: number) {
    const params = new URLSearchParams();
    if (!companyId) {
      companyId = 1;
    }
    params.append("companyId", companyId.toString());

    const finalUrl = `${this.baseUrl}?${params.toString()}`;
    return apiService.get<User[]>(finalUrl);
  }

  async getCurrentUser() {
    return apiService.get<User>(`${this.baseUrl}/me`);
  }

  async getUserById(id: number) {
    return apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(data: CreateUserData) {
    return apiService.post<User>(this.baseUrl, data);
  }

  async updateUser(id: number, data: UpdateUserData) {
    return apiService.patch<User>(`${this.baseUrl}/${id}`, data);
  }

  async deleteUser(id: number) {
    return apiService.delete<User>(`${this.baseUrl}/${id}`);
  }

  async activateUser(id: number) {
    return apiService.patch<User>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateUser(id: number) {
    return apiService.patch<User>(`${this.baseUrl}/${id}/deactivate`);
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    return apiService.post<{ message: string; url: string }>(
      `${this.baseUrl}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

export const userService = new UserService();
export default userService;
