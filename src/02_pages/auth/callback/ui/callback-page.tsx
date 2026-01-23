"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * OAuth Callback Page
 *
 * QUAN TRỌNG: Set flags NGAY LẬP TỨC trước khi component render
 * để tránh race condition với AuthContext
 */

// ⚠️ CRITICAL: Set flags ĐỒNG BỘ ngay khi module load
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state');

  if (state === 'success') {
    // OAuth luôn coi như persistent (ghi nhớ)
    localStorage.setItem('IS_PERSISTENT', '1');
    sessionStorage.setItem('SESSION_ACTIVE', '1');
    console.log('[OAuth Callback] Flags set immediately on module load');
  }
}

/**
 * OAuth Callback Page Component
 *
 * Flow:
 * 1. Backend xử lý Microsoft OAuth
 * 2. Backend set HTTP-only cookie
 * 3. Backend redirect về: /auth/callback?state=success
 * 4. Module load → Set flags NGAY
 * 5. Component render → Hiển thị UI và redirect
 */
export function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xác thực...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const state = searchParams?.get('state');
        const error = searchParams?.get('error');

        // Trường hợp lỗi từ BE
        if (error) {
          setStatus('error');
          setMessage(decodeURIComponent(error));

          // Redirect về login sau 3s
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
          return;
        }

        // Trường hợp thành công
        if (state === 'success') {
          console.log('[OAuth Callback] Authentication successful, redirecting...');

          setStatus('success');
          setMessage('Đăng nhập thành công!');

          // Redirect về dashboard sau 800ms
          setTimeout(() => {
            router.replace('/');
          }, 800);
        } else {
          // State không hợp lệ
          throw new Error('Invalid callback state');
        }
      } catch (err) {
        console.error('[OAuth Callback] Error:', err);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực. Vui lòng thử lại.');

        // Redirect về login sau 3s
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">

        {/* Icon Status */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 text-[#20a19c] animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {status === 'processing' && 'Đang xử lý...'}
          {status === 'success' && 'Thành công!'}
          {status === 'error' && 'Có lỗi xảy ra'}
        </h2>

        <p className="text-center text-slate-600 mb-8">
          {message}
        </p>

        {/* Progress indicator */}
        {status === 'processing' && (
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-[#20a19c] animate-pulse"></div>
          </div>
        )}

        {/* Error retry button */}
        {status === 'error' && (
          <button
            onClick={() => router.replace('/login')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Quay về trang đăng nhập
          </button>
        )}
      </div>
    </div>
  );
}
