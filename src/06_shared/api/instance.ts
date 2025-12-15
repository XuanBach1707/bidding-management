import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// Import 2 thư viện chuyển đổi
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

import { authStorage } from '@/shared/lib/auth'; // Giữ nguyên đường dẫn của bạn

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.112.109.171:8000/";

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// =================================================================
// 1. REQUEST INTERCEPTOR (Gửi đi: camelCase -> snake_case)
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Gắn Token
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Tự động chuyển đổi dữ liệu gửi đi sang snake_case
    // Lưu ý: KHÔNG chuyển đổi nếu là FormData (để upload file không bị lỗi)
    if (config.data && !(config.data instanceof FormData)) {
      config.data = snakecaseKeys(config.data, { deep: true });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// 2. RESPONSE INTERCEPTOR (Nhận về: snake_case -> camelCase)
// =================================================================
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 1. Tự động chuyển đổi dữ liệu nhận về sang camelCase
    if (response.data && typeof response.data === 'object') {
      // deep: true để nó lội vào tận cùng ngõ hẻm của object để sửa
      response.data = camelcaseKeys(response.data, { deep: true });
    }

    return response.data;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // (Optional) Bạn có thể convert cả response lỗi sang camelCase để dễ hiển thị
      if (error.response.data && typeof error.response.data === 'object') {
         error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
      }

      const status = error.response.status;

      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
             const isLoginPage = window.location.pathname.includes('/login');
             
             if (!isLoginPage) {
                console.error("Token hết hạn -> Logout...");
                authStorage.clear(); 
                window.location.href = '/login'; 
             }
          }
          break;

        case 403:
          console.error("Forbidden: Không có quyền truy cập.");
          break;

        case 500:
          console.error("Server Error: Lỗi hệ thống.");
          break;

        default:
          break;
      }
    } else {
      console.error("Network Error: Không thể kết nối Server.");
    }
    
    return Promise.reject(error);
  }
);