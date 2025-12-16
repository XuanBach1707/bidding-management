import { Metadata } from "next";

// Import cái UI logic mà bạn đã export từ index.ts ở bước trước
// (Giả sử bạn đặt tên component đó là DashboardPage hoặc BotConfigPage trong feature folder)
import { DashboardPage as BotConfigUI } from "@/pages/crawler-config"; 

export const metadata: Metadata = {
  title: "Cấu hình Bot | ProcureAI",
  description: "Thiết lập luật Crawler và Lịch trình chạy",
};

export default function BotConfigPage() {
  return <BotConfigUI />;
}