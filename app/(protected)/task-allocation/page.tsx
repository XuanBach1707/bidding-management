import { Metadata } from "next";
import { TaskAllocationPage } from "@/pages/task-allocation";

export const metadata: Metadata = {
  title: "Phân bổ công việc",
  description: "Quản lý và phân bổ công việc cho nhân sự",
};

export default function TaskAllocationRoute() {
  // Đây là nơi "Dumb" nhất, chỉ import và render
  return <TaskAllocationPage />;
}