import { Task } from "@/entities/task";
import { TaskDocumentList } from "@/features/drive/task-document-list";

interface DocumentsTabProps {
  task: Task;
}

export const DocumentsTab = ({ task }: DocumentsTabProps) => {
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white p-6 rounded-lg border shadow-sm min-h-[400px]">
        
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Tài liệu công việc</h2>
          <p className="text-sm text-gray-500">
             Danh sách các tài liệu thuộc hồ sơ <span className="font-semibold text-gray-700">{task.tag || "N/A"}</span> của dự án.
          </p>
        </div>

        {/* Feature List Tài Liệu */}
        <TaskDocumentList task={task} />
        
      </div>
    </div>
  );
};