"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/entities/user";
import { authStorage } from "@/shared/lib";
import { userApi } from "@/entities/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Lấy ID an toàn dù là snake_case hay camelCase
  const getSafeUserId = (userData: any): number | null => {
    if (!userData) return null;
    return userData.userId || userData.user_id || userData.id || null;
  };

  // 1. Khởi tạo
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authStorage.getToken();
        if (token) {
          const storedUser = authStorage.getUser();
          
          if (storedUser) {
            // Set tạm data để UI hiện ngay
            // Ép kiểu any để tránh lỗi TypeScript khi data local lệch schema
            setUser(storedUser as User);

            // [FIX] Lấy ID an toàn
            const id = getSafeUserId(storedUser);
            
            if (id) {
                console.log("AuthContext: Found ID in storage, fetching details...", id);
                try {
                    // Gọi API lấy thông tin mới nhất
                    const fullUser = await userApi.getUserById(id);
                    console.log("AuthContext: Details fetched", fullUser);

                    setUser(fullUser);
                    authStorage.setUser(fullUser);
                } catch (apiError) {
                    console.warn("AuthContext: Failed to fetch user details", apiError);
                }
            } else {
                console.warn("AuthContext: No User ID found in storage", storedUser);
            }
          }
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
        authStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Refresh User
  const refreshUser = async () => {
    // Lấy user từ state hoặc storage
    const currentUser = user || authStorage.getUser();
    
    // [FIX] Lấy ID an toàn
    const id = getSafeUserId(currentUser);

    if (id) {
        try {
            console.log("AuthContext: Refreshing user data for ID:", id);
            const latestUser = await userApi.getUserById(id);
            setUser(latestUser);
            authStorage.setUser(latestUser);
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    } else {
        console.warn("AuthContext: Cannot refresh, missing User ID");
    }
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    router.replace("/login");
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