import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { authStorage } from '@/shared/lib/auth'; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://steam-elect-least-study.trycloudflare.com/";
const SKIP_TRANSFORM_HEADER = 'x-no-transform';

// Mở rộng type để chứa cờ nội bộ
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _skipTransform?: boolean;
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

const refreshHttp = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// =================================================================
// 1. REQUEST INTERCEPTOR
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ép kiểu sang CustomConfig để dùng biến _skipTransform
    const customConfig = config as CustomAxiosConfig;

    // 1. Gắn Token
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Kiểm tra header chặn transform
    const skipHeader = config.headers?.[SKIP_TRANSFORM_HEADER];
    
    // LƯU Ý QUAN TRỌNG: Lưu trạng thái vào biến nội bộ _skipTransform
    if (skipHeader) {
      customConfig._skipTransform = true;
      // Sau khi lưu xong thì xóa header đi để tránh gửi rác lên server
      delete config.headers[SKIP_TRANSFORM_HEADER];
    }

    // --- [MỚI] TỰ ĐỘNG XỬ LÝ FORM DATA ---
    // Nếu data là FormData, ta xóa Content-Type mặc định (application/json)
    // để trình duyệt tự động set multipart/form-data kèm boundary chuẩn.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Nếu data đã là URLSearchParams (đã chuẩn form) thì bỏ qua transform để tránh lỗi
    if (config.data instanceof URLSearchParams) {
        return customConfig;
    }

    // 3. Chuyển đổi dữ liệu gửi đi (Chỉ khi không có cờ chặn VÀ không phải FormData)
    if (config.data && !(config.data instanceof FormData) && !customConfig._skipTransform) {
      // Bước A: Chuyển toàn bộ Key sang snake_case (camelCase -> snake_case)
      const snakedData = snakecaseKeys(config.data, { deep: true });

      // Bước B: Kiểm tra Content-Type để xử lý body phù hợp
      // Nếu header là x-www-form-urlencoded, ta phải stringify object thành chuỗi "key=value&..."
      if (config.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
          config.data = new URLSearchParams(snakedData).toString();
      } else {
          // Mặc định (JSON)
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
    // Lấy cờ skip từ config (đã được lưu ở Request Interceptor)
    const customConfig = response.config as CustomAxiosConfig;
    const skipTransform = customConfig._skipTransform;

    // Convert dữ liệu nhận về (Chỉ convert nếu KHÔNG có cờ skip)
    if (response.data && typeof response.data === 'object' && !skipTransform) {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosConfig & { _retry?: boolean };
    const skipTransform = originalRequest?._skipTransform;

    // Convert lỗi sang camelCase (nếu không chặn)
    if (error.response?.data && typeof error.response.data === 'object' && !skipTransform) {
       error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
    }

    // --- XỬ LÝ 401 (Giữ nguyên logic cũ) ---
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshHttp.post('/auth/refresh', { refresh_token: refreshToken });
        // Refresh token API luôn trả về snake_case chuẩn nên ta convert thủ công hoặc dùng camelcaseKeys
        const responseData = camelcaseKeys(data, { deep: true });
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = responseData.data;

        if (!accessToken) throw new Error("Missing accessToken");

        authStorage.setToken(accessToken);
        if (newRefreshToken) authStorage.setRefreshToken(newRefreshToken);
        if (expiresIn) authStorage.setExpiresAt(expiresIn);

        http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        if (originalRequest.headers) {
             originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        }

        processQueue(null, accessToken);
        
        // Quan trọng: Khi retry, phải đảm bảo cờ _skipTransform vẫn được giữ
        return http(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- LOG (Giữ nguyên) ---
    if (error.response) {
        const status = error.response.status;
        if (status === 403) console.error("Forbidden");
        if (status === 500) console.error("Server Error");
    }
    
    return Promise.reject(error);
  }
);

function handleLogout() {
  if (typeof window !== 'undefined') {
     const isLoginPage = window.location.pathname.includes('/login');
     if (!isLoginPage) {
        authStorage.clear();
        window.location.href = '/login';
     }
  }
}