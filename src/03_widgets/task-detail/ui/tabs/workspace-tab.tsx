import { Task, TaskType } from "@/entities/task";
import { SelectionBrowser } from "@/features/drive/selection-browser";
import { DraftingEditor } from "@/features/task/drafting-editor";

interface WorkspaceTabProps {
  task: Task;
  // [MỚI] Thêm prop này
  isReviewMode?: boolean; 
}

export const WorkspaceTab = ({ task, isReviewMode = false }: WorkspaceTabProps) => {
  
  const renderContent = () => {
    switch (task.taskType) {
      case TaskType.SELECTION:
        return (
          <div className="max-w-5xl mx-auto">
             <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Chọn tài liệu</h2>
                <p className="text-sm text-gray-500">
                  {/* Thay đổi text hướng dẫn một chút cho Reviewer */}
                  {isReviewMode 
                    ? "Danh sách các văn bản đã được nhân viên lựa chọn cho dự án." 
                    : "Vui lòng chọn các văn bản cần thiết từ kho dữ liệu bên dưới để thêm vào dự án."
                  }
                </p>
             </div>
             {/* Truyền prop isReadOnly */}
             <SelectionBrowser task={task} isReadOnly={isReviewMode} />
          </div>
        );
      
      case TaskType.DRAFTING:
        {/* Truyền prop isReadOnly */}
        return <DraftingEditor task={task} isReadOnly={isReviewMode} />;

      default: 
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