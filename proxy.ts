import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- CẤU HÌNH ---
// Loại bỏ dấu / ở cuối để tránh double slash
const BACKEND_URL = (process.env.BACKEND_URL || "http://10.10.0.158:43210").replace(/\/$/, "");

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BỎ QUA nếu không phải request gọi API Proxy
  if (!pathname.startsWith('/api-proxy')) {
    return NextResponse.next();
  }

  // 2. XỬ LÝ RIÊNG CHO MODULE AI
  if (pathname.startsWith('/api-proxy/ai-bidding')) {
    const internalUrl = new URL(pathname.replace('/api-proxy', '/api/proxy-ai'), request.url);
    return NextResponse.rewrite(internalUrl);
  }

  // 3. XỬ LÝ PROXY SANG BACKEND
  // Lấy path thực tế (bỏ tiền tố /api-proxy)
  let targetPath = pathname.replace('/api-proxy', '');

  // --- [FIX QUAN TRỌNG TẠI ĐÂY] ---
  // Kiểm tra nếu path kết thúc bằng dấu / và không phải là root (/) thì cắt đi
  // Ví dụ: /tasks/user/me/  ---> /tasks/user/me
  if (targetPath.length > 1 && targetPath.endsWith('/')) {
      targetPath = targetPath.slice(0, -1);
  }
  // -------------------------------

  // 4. CHỐT URL ĐÍCH
  const destinationUrl = `${BACKEND_URL}${targetPath}${search}`;

  // =====================================================================
  // 5. QUAN TRỌNG: BƠM HEADER ĐỂ BE BIẾT NÓ ĐANG NẰM SAU PROXY
  // =====================================================================
  const requestHeaders = new Headers(request.headers);
  
  requestHeaders.set('X-Forwarded-Host', request.headers.get('host') || '');
  requestHeaders.set('X-Forwarded-Proto', request.nextUrl.protocol.replace(':', ''));
  requestHeaders.set('X-Forwarded-Prefix', '/api-proxy');

  // 6. THỰC HIỆN REWRITE KÈM HEADERS MỚI
  return NextResponse.rewrite(new URL(destinationUrl), {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api-proxy/:path*',
};