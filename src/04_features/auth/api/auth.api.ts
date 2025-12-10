import { z } from "zod";

// Import từ Public API
import { 
  http, 
  UserSchema, 
  type User,         // Import luôn type User cho gọn
  type ApiResponse 
} from "@/shared/api"; // Đảm bảo đường dẫn đúng alias

// ----------------------------------------------------------------------
// 1. ĐỊNH NGHĨA SCHEMA & TYPE
// ----------------------------------------------------------------------

// Request: Login
export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Response: Login Data (Core data nằm trong biến data)
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(), // NÊN CÓ: để FE biết bao giờ token hết hạn
  user: UserSchema, 
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ----------------------------------------------------------------------
// 2. SERVICE API
// ----------------------------------------------------------------------

export const authApi = {
  /**
   * Đăng nhập
   * POST /auth/login
   */
  login: async (data: LoginRequest) => {
    // 1. Gọi API: TypeScript sẽ hiểu response trả về là ApiResponse<LoginResponse>
    const response = await http.post<any, ApiResponse<LoginResponse>>(
      "/auth/login", 
      data
    );
    
    // 2. Logic này đúng vì:
    // - Interceptor (instance.ts) trả về body JSON: { success: true, data: {...} }
    // - Ở đây ta chọc tiếp vào .data để lấy cục { accessToken, user }
    return response.data; 
  },

  /**
   * Lấy Profile (khi F5)
   * GET /auth/me
   */
  getMe: async () => {
    // Dùng type User cho ngắn gọn thay vì z.infer...
    const response = await http.get<any, ApiResponse<User>>(
      "/auth/me"
    );
    return response.data;
  },

  /**
   * Đăng xuất
   * POST /auth/logout
   */
  logout: async () => {
    // Logout thường không cần quan tâm dữ liệu trả về, chỉ cần không lỗi
    return http.post<any, ApiResponse<any>>("/auth/logout");
  }
};