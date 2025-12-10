"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/shared/lib/auth"; // Check lại đường dẫn
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // 1. Lấy token
      const token = authStorage.getToken();

      if (!token) {
        // 2. Không có -> Đá về Login
        console.log("AuthGuard: Missing token, redirecting...");
        router.replace("/login");
      } else {
        // 3. Có -> Tắt loading để hiện nội dung
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Nếu đang check hoặc chưa có quyền -> Hiện loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Đã qua cửa -> Render con
  return <>{children}</>;
}