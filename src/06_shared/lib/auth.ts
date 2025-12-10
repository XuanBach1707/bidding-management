// src/shared/lib/auth-storage.ts

// Định nghĩa Key ở một chỗ để tránh gõ sai
const STORAGE_KEY = {
  ACCESS_TOKEN: "ACCESS_TOKEN",
  REFRESH_TOKEN: "REFRESH_TOKEN",
  EXPIRES_IN: "EXPIRES_IN", // Lưu thời gian hết hạn (dạng timestamp hoặc giây)
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
  // 2. REFRESH TOKEN (Mới thêm)
  // ==============================
  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string) => {
    if (typeof window === "undefined") return;
    // Kiểm tra kỹ null/undefined vì refresh token đôi khi BE không trả về
    if (!token) return; 
    localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, token);
  },

  // ==============================
  // 3. EXPIRES IN (Mới thêm)
  // ==============================
  getExpiresIn: (): number | null => {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(STORAGE_KEY.EXPIRES_IN);
    return value ? Number(value) : null;
  },

  setExpiresIn: (seconds: number) => {
    if (typeof window === "undefined") return;
    // Lưu ý: Nên lưu thời điểm hết hạn cụ thể (Current Time + Expires In)
    // Ví dụ: Bây giờ là 10h, expires trong 1h -> Lưu "11h"
    // Nhưng để đơn giản, ta cứ lưu raw số giây backend trả về trước đã
    localStorage.setItem(STORAGE_KEY.EXPIRES_IN, String(seconds));
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
  // 5. CLEAR ALL (LOGOUT)
  // ==============================
  clear: () => {
    if (typeof window === "undefined") return;
    // Xóa sạch sẽ tất cả keys liên quan
    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY.EXPIRES_IN);
    localStorage.removeItem(STORAGE_KEY.USER_INFO);
    
    // Xóa luôn mấy key rác cũ của bạn (chạy 1 lần rồi xóa dòng này đi cũng được)
    localStorage.removeItem("authToken");
    localStorage.removeItem("pms_auth_token");
    localStorage.removeItem("currentUser");
  }
};