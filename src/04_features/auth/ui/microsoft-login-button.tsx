"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface MicrosoftLoginButtonProps {
  className?: string;
}

/**
 * Microsoft OAuth Login Button
 *
 * Flow:
 * 1. User click button
 * 2. Redirect trực tiếp đến /api-proxy/auth/microsoft/login
 * 3. BE redirect sang Microsoft OAuth URL
 * 4. User login tại Microsoft
 * 5. Microsoft callback về BE
 * 6. BE set HTTP-only cookie và redirect về /auth/callback?state=success
 * 7. Callback page set session flags và redirect về dashboard
 */
export function MicrosoftLoginButton({
  className = "",
}: MicrosoftLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = () => {
    setIsLoading(true);

    // Log để debug

    // Redirect trực tiếp đến BE endpoint
    // BE sẽ tự redirect sang Microsoft login page
    window.location.href = '/api-proxy/auth/microsoft/login';

    // Note: Không cần setIsLoading(false) vì page sẽ redirect ngay
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
