import { Task, TaskType } from "@/entities/task";
import { SelectionBrowser } from "@/features/drive/selection-browser";
import { DraftingEditor } from "@/features/task/drafting-editor";

interface WorkspaceTabProps {
  task: Task;
}

export const WorkspaceTab = ({ task }: WorkspaceTabProps) => {
  // Logic switch UI dựa trên Task Type
  const renderContent = () => {
    switch (task.taskType) {
      case TaskType.SELECTION:
        return (
          <div className="max-w-5xl mx-auto">
             <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Chọn tài liệu</h2>
                <p className="text-sm text-gray-500">
                  Vui lòng chọn các văn bản cần thiết từ kho dữ liệu bên dưới để thêm vào dự án.
                </p>
             </div>
             <SelectionBrowser task={task} />
          </div>
        );
      
      case TaskType.DRAFTING:
        return <DraftingEditor task={task} />;

      default: // AUTO hoặc khác
        return (
          <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed rounded-lg">
             <p>Loại công việc này được xử lý tự động hoặc không hỗ trợ Workspace.</p>
          </div>
        );
    }
  };

  return (
    <div className="pb-10">
      {renderContent()}
    </div>
  );
};