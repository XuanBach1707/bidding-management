import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

// Đảm bảo bạn đã update file auth-storage như bước trước (có hàm setExpiresAt)
import { authStorage } from '@/shared/lib/auth'; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://26.112.109.171:8000/";

// 1. Instance chính (Dùng cho mọi request thông thường)
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 2. Instance phụ (CHỈ dùng để gọi API refresh token)
// Lý do: Để tránh bị lặp vô tận nếu chính API refresh cũng bị interceptor chặn
const refreshHttp = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- LOGIC HÀNG ĐỢI (QUEUE) ---
// Giúp xử lý trường hợp nhiều request cùng bị 401 một lúc
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

    // 2. Chuyển đổi dữ liệu gửi đi (camelCase -> snake_case)
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
    // Convert dữ liệu nhận về (snake_case -> camelCase)
    if (response.data && typeof response.data === 'object') {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Convert lỗi sang camelCase (để dễ debug trên FE)
    if (error.response?.data && typeof error.response.data === 'object') {
       error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
    }

    // --- XỬ LÝ 401: Token hết hạn ---
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // Nếu đang có tiến trình refresh chạy rồi, request này sẽ xếp hàng đợi
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();

      // Nếu không có refresh token -> Logout ngay
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // --- GỌI API REFRESH ---
        // Sử dụng refreshHttp (không qua interceptor chính)
        // Body: { "refresh_token": "string" }
        const { data } = await refreshHttp.post('/auth/refresh', { 
          refresh_token: refreshToken 
        });
        
        // --- XỬ LÝ DỮ LIỆU TRẢ VỀ ---
        // API trả về: { success: true, data: { access_token, refresh_token, expiresIn, ... } }
        
        // 1. Dùng camelcaseKeys để chuẩn hóa key nhận về (access_token -> accessToken)
        const responseData = camelcaseKeys(data, { deep: true });
        
        // 2. Lấy data từ responseData.data (do wrapper của API)
        const { 
            accessToken, 
            refreshToken: newRefreshToken, 
            expiresIn 
        } = responseData.data;

        if (!accessToken) {
            throw new Error("API Refresh thành công nhưng không có accessToken");
        }

        // 3. Lưu lại vào Storage
        authStorage.setToken(accessToken);
        
        // Nếu BE trả về refresh token mới thì cập nhật, không thì giữ cái cũ
        if (newRefreshToken) {
            authStorage.setRefreshToken(newRefreshToken);
        }
        
        // Lưu thời gian hết hạn (dùng hàm setExpiresAt bạn đã update ở bước trước)
        if (expiresIn) {
            authStorage.setExpiresAt(expiresIn);
        }

        // 4. Update header cho request hiện tại & request trong hàng đợi
        http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        if (originalRequest.headers) {
             originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        }

        // 5. Giải phóng hàng đợi
        processQueue(null, accessToken);

        // 6. Gọi lại request ban đầu với token mới
        return http(originalRequest);

      } catch (refreshError) {
        // Refresh thất bại (Refresh token hết hạn hoặc lỗi server) -> Logout
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- LOG CÁC LỖI KHÁC ---
    if (error.response) {
       const status = error.response.status;
       switch (status) {
         case 403: console.error("Forbidden: Không có quyền."); break;
         case 500: console.error("Server Error."); break;
       }
    } else {
       console.error("Network Error: Không thể kết nối Server.");
    }
    
    return Promise.reject(error);
  }
);

// Helper Logout
function handleLogout() {
  if (typeof window !== 'undefined') {
     const isLoginPage = window.location.pathname.includes('/login');
     if (!isLoginPage) {
        console.warn("Phiên đăng nhập hết hạn. Đang đăng xuất...");
        authStorage.clear();
        window.location.href = '/login';
     }
  }
}