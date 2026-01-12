import { z } from "zod";
import { http, type ApiResponse } from "@/shared/api";

// [SỬA 1] Import User và UserSchema từ Entity
import { User, UserSchema } from "@/entities/user";

// ----------------------------------------------------------------------
// 1. ĐỊNH NGHĨA SCHEMA & TYPE
// ----------------------------------------------------------------------

export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
  // [THÊM MỚI] Field này bắt buộc phải có để Form truyền xuống BE
  rememberMe: z.boolean(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(), 
  // [SỬA 2] Sử dụng UserSchema của Entity
  user: UserSchema, 
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ----------------------------------------------------------------------
// 2. SERVICE API
// ----------------------------------------------------------------------

export const authApi = {
  /**
   * Đăng nhập
   */
  login: async (data: LoginRequest) => {
    // ApiResponse<LoginResponse> sẽ trả về cấu trúc chứa User chuẩn
    const response = await http.post<any, ApiResponse<LoginResponse>>(
      "/auth/login", 
      data
    );
    
    if (!response.success) {
        throw new Error(response.message || "Đăng nhập thất bại");
    }

    // Backend trả về: { success: true, data: { access_token, user: {...} } }
    if (!response.data) {
        throw new Error("Không nhận được dữ liệu từ hệ thống");
    }

    return response.data; 
  },

  /**
   * Lấy Profile (khi F5 hoặc AuthGuard chạy)
   * Cookie HttpOnly sẽ tự động bay theo request này
   */
  getMe: async (): Promise<User> => {
    // Gọi API, ép kiểu response data về User chuẩn
    const response = await http.get<any, ApiResponse<User>>(
      "/auth/me"
    );

    if (!response.success) {
        // AuthGuard sẽ bắt lỗi này để đá về trang login
        throw new Error(response.message || "Không thể lấy thông tin người dùng");
    }

    if (!response.data) {
        throw new Error("Dữ liệu người dùng trống");
    }

    return response.data;
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    // Gọi endpoint này để BE xóa cookie
    return http.post<any, ApiResponse<any>>("/auth/logout");
  }
};