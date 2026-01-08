// src/app/(auth)/login/page.tsx

import { Metadata } from "next";
import { LoginPage } from "@/02_pages/login"; // Import từ index.ts

// [QUAN TRỌNG] Metadata phải nằm ở đây (Server Component)
export const metadata: Metadata = {
  title: "Đăng nhập | PC1 Bidding Hub",
  description: "Hệ thống quản lý đấu thầu tập trung",
};

export default function Route() {
  return <LoginPage />;
}