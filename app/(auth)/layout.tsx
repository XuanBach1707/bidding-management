"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/model/auth-context"; 

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // --- LOGIC: CHẶN NGƯỜI ĐÃ LOGIN ---
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  // --- RENDER ---
  
  // 1. Loading screen (Vẫn cần để che lúc đang check)
  if (isLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#20a19c]" />
      </div>
    );
  }

  // 2. Trả về children nguyên bản (Không bọc div style gì cả)
  return <>{children}</>;
}