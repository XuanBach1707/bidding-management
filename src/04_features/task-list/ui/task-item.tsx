import { format } from "date-fns"; // Hoặc dùng hàm format date của bạn
import { Clock, FileText, CheckSquare, FolderOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Task, TaskType } from "@/entities/task"; 

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onClick: () => void;
}

// Map màu sắc badge theo Task Type (Dựa trên ảnh thiết kế)
const getTypeStyles = (type: TaskType) => {
  switch (type) {
    case TaskType.DRAFTING:
      return "bg-purple-100 text-purple-700 border-purple-200";
    case TaskType.SELECTION:
      return "bg-green-100 text-green-700 border-green-200";
    case TaskType.AUTO:
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeLabel = (type: TaskType) => {
  switch (type) {
    case TaskType.DRAFTING: return "DRAFTING";
    case TaskType.SELECTION: return "SELECTION";
    case TaskType.AUTO: return "AUTO";
    default: return type;
  }
};

export const TaskItem = ({ task, isActive, onClick }: TaskItemProps) => {
  const typeStyles = getTypeStyles(task.taskType);

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md mb-3",
        isActive 
          ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200" 
          : "border-gray-200 bg-white hover:border-blue-300"
      )}
    >
      {/* Header: Badge Type & Deadline */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn("px-2 py-0.5 text-xs font-bold rounded border", typeStyles)}>
          {getTypeLabel(task.taskType)}
        </span>
        
        {task.deadline && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {/* Format date đơn giản, bạn có thể tùy chỉnh */}
            <span>{new Date(task.deadline).toLocaleDateString("vi-VN")}</span>
          </div>
        )}
      </div>

      {/* Body: Task Name */}
      <h4 className={cn(
        "text-sm font-semibold line-clamp-2 mb-1",
        isActive ? "text-blue-700" : "text-gray-900"
      )}>
        {task.taskName}
      </h4>

      {/* Footer: Project Name */}
      <div className="flex items-center text-xs text-gray-500 mt-2">
        <FolderOpen className="w-3 h-3 mr-1.5 flex-shrink-0" />
        <span className="truncate max-w-[200px]" title={task.projectName}>
           {task.projectName || "Không có dự án"}
        </span>
      </div>
    </div>
  );
};