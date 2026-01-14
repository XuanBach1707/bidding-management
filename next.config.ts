import type { NextConfig } from "next";

// [CẬP NHẬT] Đường dẫn Server mới (Cloudflare Tunnel)
const BACKEND_URL = "http://10.11.1.2:43210";

const FORCE_SLASH_PATHS = [
  '/bidding-packages',
  '/packages_req',
  '/crawler-config',
  '/organization',
  '/users',
  '/abac',
  '/system',
  '/bidding-projects',
  '/tasks',
];

const nextConfig: NextConfig = {
  trailingSlash: false,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },

  async rewrites() {
    // Mảng chứa tất cả các rules được sinh ra
    const forceSlashRules: any[] = [];

    FORCE_SLASH_PATHS.forEach((path) => {
      // RULE 1: Xử lý trường hợp gọi đúng tên module (VD: /users)
      // -> Ép phải có dấu / ở cuối destination
      forceSlashRules.push({
        source: `/api-proxy${path}`, 
        destination: `${BACKEND_URL}${path}/`, 
      });

      // RULE 2: Xử lý trường hợp có path con (VD: /users/123)
      // -> Dùng :slug* bình thường, có dấu / ngăn cách rõ ràng
      forceSlashRules.push({
        source: `/api-proxy${path}/:slug*`,
        destination: `${BACKEND_URL}${path}/:slug*`,
      });
    });

    return [
      // 1. Nhúng danh sách rules đã sinh ra ở trên
      ...forceSlashRules,

      // 2. Auth
      {
        source: '/api-proxy/auth/:path*',
        destination: `${BACKEND_URL}/auth/:path*`,
      },
      
      // 3. Catch-all cho các API khác (Tasks, Drive...)
      {
        source: '/api-proxy/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;