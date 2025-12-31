import { UsersPage } from "@/pages/users";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý nhân sự | ProcureAI",
  description: "Danh sách và phân quyền nhân sự hệ thống",
};

export default function Page() {
  return <UsersPage />;
}