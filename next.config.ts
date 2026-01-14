import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Giữ lại setting framework
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Nếu bạn dùng Image component thì thêm config images, v.v.
  // KHÔNG CẦN: async rewrites() hay redirects() nữa
};

export default nextConfig;