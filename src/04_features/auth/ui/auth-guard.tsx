"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api"; // Import authApi
import { authStorage } from "@/shared/lib/auth";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // 1. Gọi API check user (Cookie sẽ tự bay theo request này)
        const userData = await authApi.getMe();
        
        // 2. Nếu OK (200), cập nhật lại info user mới nhất vào storage (phòng khi user đổi tên/avatar)
        authStorage.setUser(userData);
        
        // 3. Cho phép vào
        setIsLoading(false);
      } catch (error) {
        // 4. Nếu lỗi (401 Unauthorized), đá về login
        console.log("AuthGuard: Session invalid or expired");
        authStorage.clear(); // Xóa info rác
        router.replace("/login");
      }
    };

    verifySession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#20a19c]" />
      </div>
    );
  }

  return <>{children}</>;
}