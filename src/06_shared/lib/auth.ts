import { z } from "zod";
import { TokenSchema } from "../api/schema"; // Tận dụng schema Zod đã viết

const TOKEN_KEY = "ACCESS_TOKEN";
const USER_KEY = "USER_INFO";

export const authStorage = {
  // Lấy Token
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lưu Token (Có validate bằng Zod nếu muốn chắc chắn)
  setToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Xóa Token (Logout)
  clearToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  // Lưu thông tin User tạm vào LocalStorage để hiển thị nhanh
  setUser: (user: unknown) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  getUser: () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};