import { BiddingHistoryPage } from "@/pages/bidding-history";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kho dữ liệu thầu | ProcureAI",
  description: "Tra cứu tài liệu dự án cũ",
};

export default function Page() {
  return <BiddingHistoryPage />;
}