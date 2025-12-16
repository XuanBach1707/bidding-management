// src/shared/lib/auth-storage.ts

const STORAGE_KEY = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  EXPIRES_AT: "EXPIRES_AT", // Đổi tên để rõ nghĩa: Thời điểm hết hạn (Timestamp)
  USER_INFO: "USER_INFO",
};

export const authStorage = {
  // ==============================
  // 1. ACCESS TOKEN
  // ==============================
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
  },
  
  setToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, token);
  },

  // ==============================
  // 2. REFRESH TOKEN
  // ==============================
  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string) => {
    if (typeof window === "undefined") return;
    if (!token) return; 
    localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, token);
  },

  // ==============================
  // 3. EXPIRES AT (Logic Mới)
  // ==============================
  // Lấy ra thời điểm hết hạn (Timestamp)
  getExpiresAt: (): number | null => {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(STORAGE_KEY.EXPIRES_AT);
    return value ? Number(value) : null;
  },

  // Lưu vào: Nhận số giây (seconds) -> Cộng với Date.now()
  setExpiresAt: (seconds: number) => {
    if (typeof window === "undefined") return;
    // Date.now() tính bằng ms, nên seconds phải * 1000
    const expiresAt = Date.now() + seconds * 1000; 
    localStorage.setItem(STORAGE_KEY.EXPIRES_AT, String(expiresAt));
  },

  // ==============================
  // 4. USER INFO
  // ==============================
  getUser: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY.USER_INFO);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser: (user: unknown) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY.USER_INFO, JSON.stringify(user));
  },

  // ==============================
  // 5. CLEAR ALL
  // ==============================
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEY.USER_INFO);
    
    // Cleanup cũ
    localStorage.removeItem("authToken");
    localStorage.removeItem("pms_auth_token");
    localStorage.removeItem("currentUser");
  }
};