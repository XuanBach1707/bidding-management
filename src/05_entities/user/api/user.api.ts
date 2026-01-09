// File: src/entities/user/api/user-api.ts

import { http } from "@/shared/api";
import { 
  User, 
  CreateUserFormValues, 
  UpdateUserFormValues,
  ChangePasswordFormValues, 
  ResetPasswordFormValues 
} from "../model/types"; 

export const userApi = {
  // =================================================================
  // 1. BASIC CRUD
  // =================================================================

  // Lấy danh sách users
  // GET /users/
  getUsers: async (): Promise<User[]> => {
    const response = await http.get<User[]>("/users/"); 
    // Interceptor đã convert snake_case -> camelCase
    return response as unknown as User[]; 
  },

  // Lấy chi tiết user
  // GET /users/{id}
  getUserById: async (userId: number): Promise<User> => {
    const response = await http.get<User>(`/users/${userId}`);
    return response as unknown as User;
  },

  // Tạo mới user
  // POST /users/
  createUser: async (data: CreateUserFormValues): Promise<User> => {
    // Interceptor sẽ tự convert data (camelCase) -> payload (snake_case)
    const response = await http.post<User>("/users/", data);
    return response as unknown as User;
  },

  // Cập nhật thông tin (trừ mật khẩu)
  // PUT /users/{id}
  updateUser: async (userId: number, data: UpdateUserFormValues): Promise<User> => {
    const response = await http.put<User>(`/users/${userId}`, data);
    return response as unknown as User;
  },

  // Xóa user
  // DELETE /users/{id}
  deleteUser: async (userId: number): Promise<void> => {
    await http.delete(`/users/${userId}`);
  },

  // =================================================================
  // 2. PASSWORD ACTIONS
  // =================================================================

  /**
   * User tự đổi mật khẩu
   * PUT /users/me/password
   * Payload: { newPassword, confirmPassword }
   */
  changePassword: async (data: ChangePasswordFormValues): Promise<void> => {
    await http.put("/users/me/password", data);
  },

  /**
   * Admin reset mật khẩu user khác
   * PUT /users/{id}/reset-password
   * Payload: { newPassword }
   */
  resetPassword: async (userId: number, data: ResetPasswordFormValues): Promise<void> => {
    await http.put(`/users/${userId}/reset-password`, data);
  },

  // =================================================================
  // 3. AVATAR ACTIONS
  // =================================================================

  /**
   * Upload ảnh đại diện
   * POST /users/me/avatar
   * Content-Type: multipart/form-data
   */
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    // Key 'file' phải khớp với yêu cầu của Backend (string($binary))
    formData.append("file", file);

    // LƯU Ý: 
    // Khi gửi FormData, Interceptor của bạn đã được cấu hình:
    // 1. KHÔNG transform keys sang snake_case.
    // 2. XÓA header 'Content-Type' để trình duyệt tự động thêm boundary.
    const response = await http.post<User>("/users/me/avatar", formData);
    
    // Trả về User object mới nhất (có avatarUrl mới) để cập nhật UI
    return response as unknown as User;
  },
};