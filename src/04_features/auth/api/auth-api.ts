import { z } from "zod";

// Import từ Public API (Gọn gàng, dễ kiểm soát)
import { 
  http, 
  UserSchema, 
  type ApiResponse 
} from "@/06_shared/api";

// ----------------------------------------------------------------------
// 1. ĐỊNH NGHĨA SCHEMA (Input/Output)
// ----------------------------------------------------------------------

// Schema cho dữ liệu gửi lên (Request)
export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});

// Type cho Request (tự động suy diễn)
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Schema cho dữ liệu nhận về (Response Data)
// Giả sử backend trả về: { accessToken: "...", user: {...} }
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(), // Có thể có hoặc không
  user: UserSchema, // Tái sử dụng schema User chuẩn từ shared
});

// Type cho Response
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ----------------------------------------------------------------------
// 2. CÁC HÀM GỌI API (Services)
// ----------------------------------------------------------------------

export const authApi = {
  /**
   * Đăng nhập hệ thống
   * @param data {email, password}
   */
  login: async (data: LoginRequest) => {
    // Gọi POST /auth/login
    // ApiResponse<LoginResponse> nghĩa là:
    // { success: true, message: "...", data: { accessToken: "...", user: ... } }
    const response = await http.post<any, ApiResponse<LoginResponse>>(
      "/auth/login", 
      data
    );
    
    // Trả về phần data chính (đã được interceptor xử lý lấy ra từ response.data)
    return response.data; 
  },

  /**
   * Lấy thông tin user hiện tại (Profile)
   * Dùng khi F5 lại trang để lấy lại thông tin user từ Token
   */
  getMe: async () => {
    // ApiResponse<typeof UserSchema> -> Kiểu dữ liệu là User
    const response = await http.get<any, ApiResponse<z.infer<typeof UserSchema>>>(
      "/auth/me"
    );
    return response.data;
  },

  /**
   * Đăng xuất (Gọi server để hủy token nếu cần)
   */
  logout: async () => {
    return http.post("/auth/logout");
  }
};