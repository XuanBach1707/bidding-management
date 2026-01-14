import type { NextConfig } from "next";

// [CẬP NHẬT] Đường dẫn Server mới (Cloudflare Tunnel)
const BACKEND_URL = "https://valley-cheers-analyses-nodes.trycloudflare.com";

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
    // Mảng chứa tất cả các rules được sinh ra cho slash
    const forceSlashRules: any[] = [];

    FORCE_SLASH_PATHS.forEach((path) => {
      // RULE 1: Xử lý trường hợp gọi đúng tên module
      forceSlashRules.push({
        source: `/api-proxy${path}`, 
        destination: `${BACKEND_URL}${path}/`, 
      });

      // RULE 2: Xử lý trường hợp có path con
      forceSlashRules.push({
        source: `/api-proxy${path}/:slug*`,
        destination: `${BACKEND_URL}${path}/:slug*`,
      });
    });

    return [
      // -----------------------------------------------------------
      // 🔥 [RULE MỚI - QUAN TRỌNG] 🔥
      // Điều hướng riêng module AI sang Custom Proxy API (để đợi 5 phút)
      // Client gọi: /api-proxy/ai-bidding/... 
      // -> Next.js lái sang: /api/proxy-ai/ai-bidding/... (File pages/api/proxy-ai/[...path].ts)
      // -----------------------------------------------------------
      {
        source: '/api-proxy/ai-bidding/:path*',
        destination: '/api/proxy-ai/ai-bidding/:path*',
      },

      // 1. Nhúng danh sách rules slash đã sinh ra ở trên
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