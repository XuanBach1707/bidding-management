import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- GIỮ NGUYÊN LOGIC CŨ ---
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

  // --- PHẦN THÊM MỚI CHO RUST WASM ---
  webpack: (config) => {
    // Bật tính năng asyncWebAssembly để load file .wasm
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true, // Giúp tránh một số lỗi layer khi build
    };

    return config;
  },
};

export default nextConfig;