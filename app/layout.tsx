// FILE: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Hoặc font Geist/Roboto tùy bạn chọn
import { cn } from "@/shared/lib/utils"; // Hàm nối class tiện lợi của Shadcn

// 1. Import Global CSS
import "@/app/styles/globals.css"; 

// 2. Import Providers (Nơi chứa React Query, Auth Context...)
import { Providers } from "@/app/providers"; 

// 3. Import Toaster
import { Toaster } from "@/shared/ui/toaster"; 

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: {
    template: "%s | PC1 Bidding Hub", // Tự động thêm đuôi cho các trang con
    default: "PC1 Bidding Hub", // Title mặc định
  },
  description: "Hệ thống quản lý đấu thầu tập trung - PC1 Group",
  icons: {
    icon: "/favicon.ico", // Nhớ thay favicon logo PC1 vào đây
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Đổi lang="vi" để trình duyệt hiểu đây là web tiếng Việt (tốt cho SEO/Goole dịch)
    <html lang="vi" suppressHydrationWarning>
      <body 
        className={cn(
          // --- QUAN TRỌNG: THIẾT LẬP NỀN TẢNG UI ---
          "min-h-screen font-sans antialiased", 
          
          // 1. Nền xám nhẹ toàn cục (Chống mỏi mắt)
          // Mọi trang (trừ Login đè lên) sẽ thừa hưởng màu nền này
          "bg-slate-100", 
          
          // 2. Màu chữ mặc định (Than chì - Không đen tuyền)
          "text-slate-900",

          inter.className
        )}
      >
        <Providers>
            {/* Nội dung trang web nằm ở đây */}
            {children}

            {/* Component Toast nằm ở đây để hiện đè lên trên tất cả */}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}