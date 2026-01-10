import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config cũ của bạn
  reactCompiler: true, 
  
  // 1. Redirect trang chủ về Login (Cũ)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },

  // 2. [THÊM MỚI] Cấu hình Proxy để né CORS
  async rewrites() {
    return [
      {
        // Khi gọi /api-proxy/... ở Frontend
        source: '/api-proxy/:path*',
        // Sẽ âm thầm chuyển sang Backend (Nhớ check đúng port Backend của bạn là 8000 hay khác nhé)
        destination: 'http://26.112.109.171:8000/:path*', 
      },
    ];
  },
};

export default nextConfig;