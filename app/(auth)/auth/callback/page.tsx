// app/(auth)/auth/callback/page.tsx

import { Metadata } from "next";
import { AuthCallbackPage } from "@/02_pages/auth/callback";

export const metadata: Metadata = {
  title: "Đang xác thực... | PC1 Bidding Hub",
  description: "Đang hoàn tất quá trình đăng nhập",
};

export default function Route() {
  return <AuthCallbackPage />;
}
