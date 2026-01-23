"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/entities/user";
import { authStorage } from "@/shared/lib/auth"; 
import { authApi } from "@/features/auth/api/auth.api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Khởi tạo & Check Session (F5 trang)
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Checking session via Cookie...");

        // Bước 1: Gọi API check Cookie xem còn sống không
        const userFromCookie = await authApi.getMe();

        // Bước 2: [UPDATED] KIỂM TRA CỜ HIỆU
        // Cookie còn sống nhưng chúng ta phải xem User có quyền vào không
        // (để chặn trường hợp Browser tự khôi phục Tab cũ)

        const isPersistent = localStorage.getItem("IS_PERSISTENT"); // Có tích Ghi nhớ
        const isSessionActive = sessionStorage.getItem("SESSION_ACTIVE"); // Tab chưa tắt

        // [FIX OAuth] Nếu KHÔNG phải ghi nhớ VÀ KHÔNG có cờ session
        // NHƯNG cookie còn sống → Có thể là OAuth login hoặc Tab đang active
        if (!isPersistent && !isSessionActive) {
             console.warn("AuthProvider: Session exists but flags missing");

             // Kiểm tra xem có phải đang ở callback page không
             // Nếu đúng thì callback page sẽ tự set flags, ta chỉ cần đợi
             const isCallbackPage = typeof window !== 'undefined' &&
                                    window.location.pathname === '/auth/callback';

             if (isCallbackPage) {
                console.log("AuthProvider: At callback page, skip flag check");
             } else {
                // Không phải callback page VÀ không có flags
                // → Browser restore hoặc user xóa flags → Force logout
                console.warn("AuthProvider: Tab Closed or Invalid Session -> Force Logout");
                throw new Error("Force Logout: Tab Closed");
             }
        }

        // Nếu qua được ải trên thì set user
        console.log("AuthProvider: Session Valid", userFromCookie);
        setUser(userFromCookie);
        authStorage.setUser(userFromCookie); 

      } catch (error) {
        console.warn("AuthProvider: No valid session or Force Logout", error);
        
        // Xử lý dọn dẹp sạch sẽ
        setUser(null);
        authStorage.clear();
        
        // Dọn dẹp luôn cờ hiệu để chắc chắn
        localStorage.removeItem("IS_PERSISTENT");
        sessionStorage.removeItem("SESSION_ACTIVE");
        
        // Nếu lỗi do Force Logout hoặc Token hết hạn, gọi API Logout cho sạch Cookie
        try {
             await authApi.logout(); 
        } catch(e) {
            // API lỗi thì kệ, client đã clear rồi
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Refresh User
  const refreshUser = async () => {
    try {
        const latestUser = await authApi.getMe();
        setUser(latestUser);
        authStorage.setUser(latestUser);
    } catch (error) {
        console.error("Failed to refresh user:", error);
    }
  };

  // 3. Logout
  const logout = async () => {
    try {
        await authApi.logout(); 
    } catch (err) {
        console.error("Logout API error", err);
    } finally {
        authStorage.clear();
        setUser(null);
        // Xóa cờ hiệu
        localStorage.removeItem("IS_PERSISTENT");
        sessionStorage.removeItem("SESSION_ACTIVE");
        
        router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};