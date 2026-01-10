// src/shared/lib/auth-storage.ts

const STORAGE_KEY = {
  USER_INFO: "USER_INFO",
};

export const authStorage = {
  // ==============================
  // CHỈ LƯU USER INFO (Để hiển thị UI)
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
  // CLEAR ALL (Khi đăng xuất)
  // ==============================
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY.USER_INFO);
    
    // Cleanup cũ (nếu muốn chắc chắn sạch sẽ thì cứ để)
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("EXPIRES_AT");
  }
};