// Đây là FSD App Layer
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Import AuthProvider (Nhớ sửa đường dẫn nếu file context nằm chỗ khác)
import { AuthProvider } from "@/features/auth/model/auth-context"; 

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* 2. Bọc AuthProvider vào trong này */}
      <AuthProvider>
         {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}