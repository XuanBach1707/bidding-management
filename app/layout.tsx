// FILE: my-project/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// 1. Import Global CSS
import "@/app/styles/globals.css"; 

// 2. Import Providers
import { Providers } from "@/app/providers"; 

// 3. Import Toaster (Chú ý đường dẫn này phải trỏ đúng nơi bạn lưu file toaster.tsx)
// Nếu bạn để trong src/06_shared/ui, đường dẫn sẽ như sau:
import { Toaster } from "@/shared/ui/toaster"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Đấu Thầu Pro",
  description: "Hệ thống phân tích thầu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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