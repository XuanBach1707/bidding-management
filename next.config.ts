import type { NextConfig } from "next";

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
        destination: `http://26.112.109.171:8000${path}/`, 
      });

      // RULE 2: Xử lý trường hợp có path con (VD: /users/123)
      // -> Dùng :slug* bình thường, có dấu / ngăn cách rõ ràng để Next.js không lỗi
      forceSlashRules.push({
        source: `/api-proxy${path}/:slug*`,
        destination: `http://26.112.109.171:8000${path}/:slug*`,
      });
    });

    return [
      // 1. Nhúng danh sách rules đã sinh ra ở trên
      ...forceSlashRules,

      // 2. Auth (Giữ nguyên)
      {
        source: '/api-proxy/auth/:path*',
        destination: 'http://26.112.109.171:8000/auth/:path*',
      },
      
      // 3. Catch-all cho các API khác (Tasks, Drive...)
      {
        source: '/api-proxy/:path*',
        destination: 'http://26.112.109.171:8000/:path*',
      },
    ];
  },
};

export default nextConfig;