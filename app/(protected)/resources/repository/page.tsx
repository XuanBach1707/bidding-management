import { Metadata } from "next";
import { ResourceRepositoryPage } from "@/pages/resources";

export const metadata: Metadata = {
  title: "Kho tài liệu chung | PC1 Group",
};

export default function Page() {
  return <ResourceRepositoryPage />;
}