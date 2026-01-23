"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { authApi } from "@/features/auth/api/auth.api";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface MicrosoftLoginButtonProps {
  className?: string;
}

/**
 * Microsoft OAuth Login Button
 *
 * Flow:
 * 1. User click button
 * 2. Gọi API GET /auth/microsoft/login để lấy OAuth URL
 * 3. Redirect user sang Microsoft login với URL nhận được
 * 4. BE tự xử lý callback và set HTTP-only cookie
 * 5. BE redirect về /auth/callback?state=success
 * 6. Callback page set session flags và redirect về dashboard
 */
export function MicrosoftLoginButton({
  className = "",
}: MicrosoftLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);

      // Gọi API để lấy Microsoft OAuth URL
      console.log('[Microsoft Login] Fetching OAuth URL...');
      const microsoftUrl = await authApi.getMicrosoftLoginUrl();

      console.log('[Microsoft Login] Redirecting to:', microsoftUrl);

      // Redirect user sang Microsoft login
      window.location.href = microsoftUrl;

      // Note: Không cần setIsLoading(false) vì page sẽ redirect ngay
    } catch (error: any) {
      console.error('[Microsoft Login] Error:', error);

      setIsLoading(false);

      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập Microsoft",
        description: error.message || "Không thể kết nối đến dịch vụ Microsoft. Vui lòng thử lại.",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleMicrosoftLogin}
      disabled={isLoading}
      className={`w-full h-12 text-base font-semibold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all ${className}`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <svg
          className="mr-3 h-5 w-5"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Microsoft Logo */}
          <rect x="0" y="0" width="10" height="10" fill="#F25022" />
          <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
          <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
          <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
        </svg>
      )}
      {isLoading ? "Đang chuyển hướng..." : "Đăng nhập với Microsoft"}
    </Button>
  );
}
