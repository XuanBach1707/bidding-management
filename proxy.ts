import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- CẤU HÌNH ---
const BACKEND_URL = process.env.BACKEND_URL || "http://10.10.0.158:43210";

// Danh sách các module bắt buộc có slash khi gọi endpoint gốc (List)
const FORCE_SLASH_PATHS = [
  '/bidding-packages',
  '/packages_req',
  '/crawler-config',
  '/organization',
  '/users',
  '/system',
  '/bidding-projects',
  '/tasks',
];

// Danh sách con của ABAC bắt buộc có slash
const ABAC_FORCE_LIST = ['policies', 'attributes'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. BỎ QUA nếu không phải request gọi API Proxy
  if (!pathname.startsWith('/api-proxy')) {
    return NextResponse.next();
  }

  // 2. XỬ LÝ RIÊNG CHO MODULE AI (Giữ logic cũ của bạn)
  // Request đến /api-proxy/ai-bidding/... sẽ được chuyển về route nội bộ Next.js
  if (pathname.startsWith('/api-proxy/ai-bidding')) {
    // Rewrite về: /api/proxy-ai/... (Folder pages/api/proxy-ai trong ảnh của bạn)
    const internalUrl = new URL(pathname.replace('/api-proxy', '/api/proxy-ai'), request.url);
    return NextResponse.rewrite(internalUrl);
  }

  // 3. XỬ LÝ PROXY SANG JAVA BACKEND
  // Lấy path thực tế (bỏ tiền tố /api-proxy)
  let targetPath = pathname.replace('/api-proxy', ''); // VD: /users
  
  // --- LOGIC QUYẾT ĐỊNH THÊM SLASH HAY KHÔNG ---
  let shouldAddSlash = false;

  // Rule A: Các path thường (Check exact match)
  // Chỉ thêm slash nếu path == '/users', không thêm nếu '/users/123'
  if (FORCE_SLASH_PATHS.some(p => targetPath === p)) {
     shouldAddSlash = true;
  }

  // Rule B: Logic ABAC
  if (targetPath.startsWith('/abac')) {
    // Tách path: /abac/policies -> ['', 'abac', 'policies']
    const parts = targetPath.split('/').filter(Boolean);
    
    // Nếu path dạng /abac/{entity} và entity nằm trong list bắt buộc -> Thêm Slash
    if (parts.length === 2 && ABAC_FORCE_LIST.includes(parts[1])) {
      shouldAddSlash = true;
    }
  }

  // Thực hiện thêm slash nếu cần
  if (shouldAddSlash && !targetPath.endsWith('/')) {
    targetPath += '/';
  }

  // 4. CHỐT URL ĐÍCH & REWRITE
  const destinationUrl = `${BACKEND_URL}${targetPath}${search}`;
  
  // Debug (Bật lên nếu cần soi xem nó map đi đâu)
  // console.log(`🚀 [Middleware] ${pathname} -> ${destinationUrl}`);

  return NextResponse.rewrite(new URL(destinationUrl));
}

// Config này giúp Middleware chỉ chạy trên các route api-proxy để tối ưu hiệu năng
export const config = {
  matcher: '/api-proxy/:path*',
};