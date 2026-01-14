"use client";

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { authStorage } from '@/shared/lib/auth';
import { FORCE_SLASH_PATHS } from './config'; 

// [CẤU HÌNH CỨNG]
const BASE_URL = "/api-proxy";
const SKIP_TRANSFORM_HEADER = 'x-no-transform';

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _skipTransform?: boolean;
  _retry?: boolean;
}

// 1. Tạo Instance chính
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 300000,
  withCredentials: true,
});

// 2. Instance phụ Refresh (để tránh loop 401)
const refreshHttp = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

// =================================================================
// REQUEST INTERCEPTOR (GỬI ĐI)
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosConfig;

    // --- [LOGIC: TỰ ĐỘNG THÊM SLASH] ---
    if (config.url && !config.url.startsWith('http')) {
        const [path, query] = config.url.split('?');
        const needsSlash = FORCE_SLASH_PATHS.some(keyword => path.includes(keyword));

        if (needsSlash && !path.endsWith('/')) {
            const newPath = `${path}/`;
            config.url = query ? `${newPath}?${query}` : newPath;
        }
    }

    // Xử lý Header Skip Transform
    const skipHeader = config.headers?.[SKIP_TRANSFORM_HEADER];
    if (skipHeader) {
      customConfig._skipTransform = true;
      delete config.headers[SKIP_TRANSFORM_HEADER];
    }

    // Xử lý FormData & URLSearchParams (Bỏ qua transform)
    if (config.data instanceof FormData || config.data instanceof URLSearchParams) {
        if (config.data instanceof FormData) delete config.headers['Content-Type'];
        return customConfig;
    }

    // --- [LOGIC CHÍNH: SNAKE CASE VỚI CƠ CHẾ CỨU CÁNH] ---
    if (config.data && typeof config.data === 'object' && !customConfig._skipTransform) {
      try {
        // Cố gắng convert Deep Snake Case
        const snakedData = snakecaseKeys(config.data as any, { deep: true });

        if (config.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
            config.data = new URLSearchParams(snakedData).toString();
        } else {
            config.data = snakedData;
        }
      } catch (err) {
        /**
         * 🛡️ CỨU CÁNH: 
         * Nếu snakecaseKeys bị crash (do data chứa null, undefined sâu hoặc object lạ),
         * ta giữ nguyên config.data nguyên bản để request tiếp tục chạy.
         */
        console.warn("⚠️ [HTTP] Snakecase conversion failed. Sending original payload to avoid crash.");
      }
    }
    return customConfig;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// RESPONSE INTERCEPTOR (NHẬN VỀ)
// =================================================================
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = response.config as CustomAxiosConfig;
    // Auto Camel Case (Snake -> Camel cho Frontend)
    if (response.data && typeof response.data === 'object' && !customConfig._skipTransform) {
      try {
        response.data = camelcaseKeys(response.data, { deep: true });
      } catch (err) {
        console.warn("⚠️ [HTTP] Camelcase conversion failed on response.");
      }
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosConfig;
    
    // Camelize dữ liệu lỗi nếu có
    if (error.response?.data && typeof error.response.data === 'object' && !originalRequest?._skipTransform) {
       try {
         error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
       } catch (e) {}
    }

    // --- LOGIC REFRESH TOKEN ---
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => http(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshHttp.post('/auth/refresh', {}); 
        processQueue(null);
        return http(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

function handleLogout() {
  if (typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true }) 
        .finally(() => {
            authStorage.clear();
            window.location.href = '/login';
        });
      }
  }
}