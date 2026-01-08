// src/entities/user/api/user-api.ts
import { http } from "@/shared/api";
import { 
  User, 
  CreateUserFormValues, 
  UpdateUserFormValues,
  ChangePasswordFormValues, // [MỚI]
  ResetPasswordFormValues   // [MỚI]
} from "../model/types"; // Import từ types.ts cho chuẩn luồng

export const userApi = {
  // GET List
  getUsers: async (): Promise<User[]> => {
    const response = await http.get<User[]>("/users/"); 
    return response as unknown as User[]; 
  },

  // GET Detail
  getUserById: async (userId: number): Promise<User> => {
    const response = await http.get<User>(`/users/${userId}`);
    return response as unknown as User;
  },

  // CREATE
  createUser: async (data: CreateUserFormValues): Promise<User> => {
    const response = await http.post<User>("/users/", data);
    return response as unknown as User;
  },

  // UPDATE INFO
  updateUser: async (userId: number, data: UpdateUserFormValues): Promise<User> => {
    const response = await http.put<User>(`/users/${userId}`, data);
    return response as unknown as User;
  },

  // DELETE
  deleteUser: async (userId: number): Promise<void> => {
    await http.delete(`/users/${userId}`);
  },

  // =================================================================
  // [MỚI] PASSWORD ACTIONS (Dùng Type chuẩn từ schema)
  // =================================================================

  /**
   * User tự đổi mật khẩu
   * PUT /users/me/password
   */
  changePassword: async (data: ChangePasswordFormValues): Promise<void> => {
    // data gồm { newPassword, confirmPassword }
    // Interceptor sẽ tự convert thành snake_case gửi lên server
    await http.put("/users/me/password", data);
  },

  /**
   * Admin reset mật khẩu user khác
   * PUT /users/{id}/reset-password
   */
  resetPassword: async (userId: number, data: ResetPasswordFormValues): Promise<void> => {
    // data gồm { newPassword }
    await http.put(`/users/${userId}/reset-password`, data);
  }
};