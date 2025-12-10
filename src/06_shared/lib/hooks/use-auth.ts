// src/06_shared/lib/hooks/use-auth.ts
"use client";

import { useState, useEffect } from 'react';
// Import từ Public API của Shared
import { type User, type UserRole } from "@/shared/api"; 
import { authStorage } from "../auth"; // Đảm bảo đúng đường dẫn

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // 1. Đọc thông tin từ Storage
    const user = authStorage.getUser() as User;
    const token = authStorage.getToken();
    
    // 2. Xác nhận trạng thái
    if (user && token) {
      setState({
        user,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      // Nếu không có token/user, nhưng không phải lỗi nghiêm trọng -> set false
      setState({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []); 

  return state;
}