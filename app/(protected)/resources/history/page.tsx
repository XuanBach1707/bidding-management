import { Metadata } from "next";
import { ResourceHistoryPage } from "@/pages/resources";

export const metadata: Metadata = {
  title: "Lịch sử lưu trữ | PC1 Group",
};

export default function Page() {
  return <ResourceHistoryPage />;
}