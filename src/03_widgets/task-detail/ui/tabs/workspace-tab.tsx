import { Task, TaskType } from "@/entities/task";
import { SelectionBrowser } from "@/features/drive/selection-browser";
import { DraftingEditor } from "@/features/task/drafting-editor";
import { FileText, FolderInput } from "lucide-react"; // Import icon bổ sung

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
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#009d98]/10 rounded-lg shrink-0">
                        <FolderInput className="w-6 h-6 text-[#009d98]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Chọn tài liệu nguồn</h2>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {isReviewMode 
                            ? "Dưới đây là danh sách các văn bản đã được nhân viên lựa chọn và tổng hợp cho dự án này." 
                            : "Vui lòng truy cập kho dữ liệu bên dưới, tìm kiếm và chọn các văn bản cần thiết để thêm vào hồ sơ dự án."
                        }
                        </p>
                    </div>
                 </div>
              </div>
              
              {/* Truyền prop isReadOnly */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                 <SelectionBrowser task={task} isReadOnly={isReviewMode} />
              </div>
          </div>
        );
      
      case TaskType.DRAFTING:
        // DraftingEditor đã tự bao gồm Container và Style chuẩn
        return <DraftingEditor task={task} isReadOnly={isReviewMode} />;

      default: 
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileText className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">Không có không gian làm việc</p>
              <p className="text-sm mt-1">Loại công việc này được xử lý tự động hoặc không hỗ trợ Workspace.</p>
          </div>
        );
    }
  };

  return (
    <div className="pb-20">
      {renderContent()}
    </div>
  );
};