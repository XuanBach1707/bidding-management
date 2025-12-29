import { http } from "@/shared/api";
import { User } from "../model/types";

export const userApi = {
  /**
   * Lấy thông tin User hiện tại (Profile)
   * GET /users/me
   */
  getMe: (): Promise<User> => {
    return http.get("/users/me");
  },

  /**
   * Lấy danh sách User (Để chọn trong dropdown gán việc)
   * GET /users
   */
  getList: (): Promise<User[]> => {
    return http.get("/users");
  },
  
  /**
   * Lấy chi tiết 1 User
   * GET /users/{id}
   */
  getById: (id: number): Promise<User> => {
    return http.get(`/users/${id}`);
  }
};