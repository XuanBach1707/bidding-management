// src/entities/user/api/user-api.ts
import { http } from "@/shared/api";
import { User, CreateUserFormValues, UpdateUserFormValues } from "../model/schemas";

export const userApi = {
  // GET /users/
  getUsers: async (): Promise<User[]> => {
    // Interceptor sẽ tự convert response snake_case -> camelCase
    // Khớp với UserSchema
    const response = await http.get<User[]>("/users/"); 
    return response as unknown as User[]; 
    // Lưu ý: axios trả về data trong response.data, nhưng interceptor của bạn 
    // ở đoạn `return response.data` đã trả về data trực tiếp.
  },

  // GET /users/{id}
  getUserById: async (userId: number): Promise<User> => {
    const response = await http.get<User>(`/users/${userId}`);
    return response as unknown as User;
  },

  // POST /users/
  createUser: async (data: CreateUserFormValues): Promise<User> => {
    // Interceptor sẽ tự convert request body camelCase -> snake_case
    const response = await http.post<User>("/users/", data);
    return response as unknown as User;
  },

  // PUT /users/{id}
  updateUser: async (userId: number, data: UpdateUserFormValues): Promise<User> => {
    const response = await http.put<User>(`/users/${userId}`, data);
    return response as unknown as User;
  },

  // DELETE /users/{id}
  deleteUser: async (userId: number): Promise<void> => {
    await http.delete(`/users/${userId}`);
  },
};