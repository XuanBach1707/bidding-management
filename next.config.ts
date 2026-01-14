import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Cấu hình xử lý Slash (Quan trọng để phối hợp với Proxy)
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // 2. Redirect trang chủ về Login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // false = 307 (Temporary Redirect)
      },
    ];
  },

  // Lưu ý: Không cần rewrites() nữa vì file proxy.ts đã lo việc đó rồi
};

export default nextConfig;