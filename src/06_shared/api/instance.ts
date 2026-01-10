import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import { authStorage } from '@/shared/lib/auth';
// [QUAN TRỌNG] Import danh sách "sổ đen" từ file config
import { FORCE_SLASH_PATHS } from './config'; 

// [CẤU HÌNH CỨNG]
const BASE_URL = "/api-proxy";
const SKIP_TRANSFORM_HEADER = 'x-no-transform';

// [DEBUG] Log ra để chắc chắn Rules đã được load
console.log("=================================================");
console.log("🚀 [AXIOS INSTANCE] Đang khởi tạo");
console.log("📋 [RULES] Số lượng API ép Slash:", FORCE_SLASH_PATHS?.length || 0);
console.log("=================================================");

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _skipTransform?: boolean;
  _retry?: boolean;
}

// 1. Tạo Instance chính
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 100000,
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
// REQUEST INTERCEPTOR (GỬI ĐI - NƠI ÉP SLASH)
// =================================================================
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosConfig;

    // --- [LOGIC CHÍNH: KIỂM TRA VÀ TỰ THÊM SLASH] ---
    if (config.url && !config.url.startsWith('http')) {
        const [path, query] = config.url.split('?');
        
        // Kiểm tra: URL hiện tại có nằm trong danh sách bắt buộc có / không?
        // Logic: Chỉ cần path chứa từ khóa (vd: '/users') là dính
        const needsSlash = FORCE_SLASH_PATHS.some(keyword => path.includes(keyword));

        // Nếu CẦN slash mà CHƯA CÓ -> Tự động thêm vào
        if (needsSlash && !path.endsWith('/')) {
            const newPath = `${path}/`;
            config.url = query ? `${newPath}?${query}` : newPath;
            console.log(`🔹 [AUTO-SLASH] Đã ép thêm / vào: ${path}`);
        }
    }
    // ----------------------------------------------------

    // Log cảnh báo nếu gọi URL tuyệt đối (Proxy sẽ không hoạt động)
    if (config.url?.startsWith("http")) {
        console.error("🚨 [CẢNH BÁO] URL Tuyệt đối:", config.url);
    }

    // Xử lý Header Skip Transform
    const skipHeader = config.headers?.[SKIP_TRANSFORM_HEADER];
    if (skipHeader) {
      customConfig._skipTransform = true;
      delete config.headers[SKIP_TRANSFORM_HEADER];
    }

    // Xử lý FormData (để Browser tự set Boundary)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Xử lý URLSearchParams
    if (config.data instanceof URLSearchParams) {
        return customConfig;
    }

    // Auto Snake Case (Camel -> Snake cho Backend)
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
// RESPONSE INTERCEPTOR (NHẬN VỀ)
// =================================================================
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = response.config as CustomAxiosConfig;
    // Auto Camel Case (Snake -> Camel cho Frontend)
    if (response.data && typeof response.data === 'object' && !customConfig._skipTransform) {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosConfig;
    
    // Convert keys lỗi về Camel
    if (error.response?.data && typeof error.response.data === 'object' && !originalRequest?._skipTransform) {
       error.response.data = camelcaseKeys(error.response.data as any, { deep: true });
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
        console.log("🔄 [AUTH] Token hết hạn, đang thử Refresh...");
        // Gọi API refresh (Lưu ý: Auth thường không cần slash, không nằm trong config nên an toàn)
        await refreshHttp.post('/auth/refresh', {}); 

        console.log("✅ [AUTH] Refresh thành công, gọi lại request cũ.");
        processQueue(null);
        return http(originalRequest);

      } catch (refreshError: any) {
        console.error("💀 [AUTH] Refresh thất bại, Force Logout.");
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
        // Logout an toàn
        axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true }) 
        .catch(err => console.warn("Logout API failed (ignored):", err))
        .finally(() => {
            console.log("👋 Đăng xuất, chuyển về Login.");
            authStorage.clear();
            window.location.href = '/login';
        });
     }
  }
}