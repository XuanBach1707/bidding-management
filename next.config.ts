import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Thêm đoạn này để tự động chuyển trang chủ về login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // Để false để sau này bạn còn sửa lại trang chủ
      },
    ];
  },
};

export default nextConfig;