// app/(protected)/profile/page.tsx

import { Metadata } from "next";
// Import từ src thông qua file index vừa tạo
import { ProfilePage } from "@/pages/profile"; 
// Hoặc nếu alias của bạn chưa map "pages" -> "02_pages":
// import { ProfilePage } from "@/02_pages/profile";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Đấu Thầu Pro",
  description: "Quản lý thông tin tài khoản và cài đặt",
};

export default function Page() {
  return <ProfilePage />;
}