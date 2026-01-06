import { Metadata } from "next";
// Import từ Layer Pages, không import trực tiếp Widget
import { ResourceOverviewPage } from "@/pages/resources"; 

export const metadata: Metadata = {
  title: "Tổng quan tài nguyên | PC1 Group",
};

export default function Page() {
  return <ResourceOverviewPage />;
}