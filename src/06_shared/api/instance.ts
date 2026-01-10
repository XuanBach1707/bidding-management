import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { authStorage } from '@/shared/lib/auth'; 

// [SỬA QUAN TRỌNG]
// Thay vì trỏ thẳng IP (bị CORS), ta trỏ vào Proxy của Next.js
// Next.js sẽ tự nối sang http://26.112.109.171:8000/ ở phía server
const BASE_URL = "/api-proxy"; 
const SKIP_TRANSFORM_HEADER = 'x-no-transform';

// Mở rộng type để chứa cờ nội bộ
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _skipTransform?: boolean;
  _retry?: boolean;
}

// =================================================================
// CẤU HÌNH AXIOS VỚI COOKIE
// =================================================================
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
  withCredentials: true, // <--- QUAN TRỌNG: Để trình duyệt gửi/nhận Cookie HttpOnly
});

const refreshHttp = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // <--- Refresh API cũng cần Cookie
});

let isRefreshing = false;
let failedQueue: any[] = [];

// Queue giờ không cần nhận token string nữa, chỉ cần resolve là được
const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

// =================================================================
// 1. REQUEST INTERCEPTOR
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosConfig;

    // 1. Kiểm tra header chặn transform
    const skipHeader = config.headers?.[SKIP_TRANSFORM_HEADER];
    if (skipHeader) {
      customConfig._skipTransform = true;
      delete config.headers[SKIP_TRANSFORM_HEADER];
    }

    // --- XỬ LÝ FORM DATA ---
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    if (config.data instanceof URLSearchParams) {
        return customConfig;
    }

    // 2. Chuyển đổi snake_case
    if (config.data && !(config.data instanceof FormData) && !customConfig._skipTransform) {
      const snakedData = snakecaseKeys(config.data, { deep: true });

      if (config.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
          config.data = new URLSearchParams(snakedData).toString();
      } else {
          config.data = snakedData;
      }
    }

    return customConfig;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// 2. RESPONSE INTERCEPTOR
// =================================================================
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = response.config as CustomAxiosConfig;
    const skipTransform = customConfig._skipTransform;

    if (response.data && typeof response.data === 'object' && !skipTransform) {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosConfig;
    const skipTransform = originalRequest?._skipTransform;

    if (error.response?.data && typeof error.response.data === 'object' && !skipTransform) {
       error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
    }

    // --- XỬ LÝ 401: REFRESH TOKEN TỰ ĐỘNG ---
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API Refresh qua Proxy
        await refreshHttp.post('/auth/refresh', {}); 

        processQueue(null);
        return http(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError);
        handleLogout(); 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- LOG ---
    if (error.response) {
        const status = error.response.status;
        if (status === 403) console.error("Forbidden - Không có quyền");
        if (status === 500) console.error("Server Error");
    }
    
    return Promise.reject(error);
  }
);

function handleLogout() {
  if (typeof window !== 'undefined') {
     const isLoginPage = window.location.pathname.includes('/login');
     if (!isLoginPage) {
        // [SỬA LẠI] Thêm dấu / để nối chuỗi cho đúng (/api-proxy/auth/logout)
        axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true }).finally(() => {
            authStorage.clear();
            window.location.href = '/login';
        });
     }
  }
}