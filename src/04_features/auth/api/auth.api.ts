import { z } from "zod";

// Import từ Public API
import { 
  http, 
  UserSchema, 
  type User, 
  type ApiResponse 
} from "@/shared/api"; 





// ----------------------------------------------------------------------
// 1. ĐỊNH NGHĨA SCHEMA & TYPE
// ----------------------------------------------------------------------

// Request: Login
export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Response: Login Data
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(), 
  user: UserSchema, 
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ----------------------------------------------------------------------
// 2. SERVICE API (Đã sửa logic check lỗi)
// ----------------------------------------------------------------------

export const authApi = {
  /**
   * Đăng nhập
   * POST /auth/login
   */
  login: async (data: LoginRequest) => {
    // 1. Gọi API
    // Interceptor của bạn đã trả về response.data (tức là cái body JSON {success, data...})
    // Nên biến 'response' ở đây chính là ApiResponse<LoginResponse>
    const response = await http.post<any, ApiResponse<LoginResponse>>(
      "/auth/login", 
      data
    );
    
    // 2. [QUAN TRỌNG] Kiểm tra logic nghiệp vụ
    // Dù HTTP Status là 200, nhưng success có thể là false (vd: sai pass)
    if (!response.success) {
        throw new Error(response.message || "Đăng nhập thất bại");
    }

    // 3. Kiểm tra data null để an toàn tuyệt đối cho TypeScript
    if (!response.data) {
        throw new Error("Không nhận được dữ liệu từ hệ thống");
    }

    // 4. Trả về data "sạch" (LoginResponse)
    return response.data; 
  },

  /**
   * Lấy Profile (khi F5)
   * GET /auth/me
   */
  getMe: async () => {
    const response = await http.get<any, ApiResponse<User>>(
      "/auth/me"
    );

    if (!response.success) {
        // Có thể ném lỗi để React Query retry hoặc redirect login
        throw new Error(response.message || "Không thể lấy thông tin người dùng");
    }

    if (!response.data) {
        throw new Error("Dữ liệu người dùng trống");
    }

    return response.data;
  },

  /**
   * Đăng xuất
   * POST /auth/logout
   */
  logout: async () => {
    // Logout thì lỏng lẻo hơn, chỉ cần gọi lên server báo 1 tiếng
    return http.post<any, ApiResponse<any>>("/auth/logout");
  }
};