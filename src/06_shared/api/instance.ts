import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '@/06_shared/lib/auth'; // Import hàm quản lý token đã viết lúc nãy

// Lấy URL từ biến môi trường
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Cấu hình chung cho Axios
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 giây
});

// =================================================================
// 1. REQUEST INTERCEPTOR (Chặn trước khi gửi đi)
// Nhiệm vụ: Tự động lấy Token từ LocalStorage gắn vào Header
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dùng hàm trong auth.ts thay vì gọi trực tiếp localStorage
    const token = authStorage.getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// 2. RESPONSE INTERCEPTOR (Chặn sau khi nhận về)
// Nhiệm vụ: Xử lý dữ liệu gọn gàng & Bắt lỗi Token hết hạn (401)
// =================================================================
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về thẳng data để khi gọi chỉ cần biến.data, không cần biến.data.data
    return response.data;
  },
  async (error: AxiosError) => {
    // Nếu có lỗi từ phía Server trả về (có response)
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // LỖI QUAN TRỌNG NHẤT: Unauthorized (Hết hạn token hoặc chưa đăng nhập)
          console.error("Token hết hạn hoặc không hợp lệ -> Đang Logout...");
          
          // 1. Xóa token bẩn trong storage
          authStorage.clearToken();
          
          // 2. Điều hướng về trang đăng nhập (Chỉ chạy ở client side)
          if (typeof window !== 'undefined') {
             // Dùng window.location để reset sạch state của React
             window.location.href = '/login'; 
          }
          break;

        case 403:
          console.error("Bạn không có quyền truy cập vào tài nguyên này (Forbidden).");
          // Có thể hiển thị Toast thông báo lỗi ở đây
          break;

        case 500:
          console.error("Lỗi hệ thống (Internal Server Error). Vui lòng thử lại sau.");
          break;

        default:
          console.error(`Lỗi API (${status}):`, error.response.data);
      }
    } else {
      // Lỗi mạng (Mất mạng, Server sập hoàn toàn không phản hồi)
      console.error("Không thể kết nối đến Server. Vui lòng kiểm tra đường truyền.");
    }
    
    return Promise.reject(error);
  }
);