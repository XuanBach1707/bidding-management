"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/06_shared/lib"; // Lấy hàm check token
import { Loader2 } from "lucide-react"; // Icon xoay

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra xem có token trong túi không
    const token = authStorage.getToken();

    if (!token) {
      // 2. Không có -> Đá về Login ngay
      router.replace("/login");
    } else {
      // 3. Có -> Mở cửa cho vào
      setIsAuthorized(true);
    }
  }, [router]);

  // Trong lúc đang check token thì hiện loading xoay
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nếu đã xác thực thì hiển thị nội dung bên trong (Sidebar + Page)
  return (
    <div className="min-h-screen bg-background">
      {/* Sau này Sidebar sẽ đặt ở đây */}
      <main>{children}</main>
    </div>
  );
}