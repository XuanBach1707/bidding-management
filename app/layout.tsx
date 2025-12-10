// FILE: my-project/app/layout.tsx (Nằm ở Root)
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// 1. Import Global CSS từ SRC
import "@/app/styles/globals.css"; 

// 2. Import Providers từ SRC
import { Providers } from "@/app/providers"; 

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
        {/* Bọc Provider lấy từ src vào đây */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}