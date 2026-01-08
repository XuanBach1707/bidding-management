import { format } from "date-fns"; 
import { Clock, CheckCircle2, FolderOpen, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Task, TaskType } from "@/entities/task"; 

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onClick: () => void;
}

const getTypeStyles = (type: TaskType) => {
  switch (type) {
    case TaskType.DRAFTING: return "bg-purple-100 text-purple-700 border-purple-200";
    case TaskType.SELECTION: return "bg-green-100 text-green-700 border-green-200";
    case TaskType.AUTO: return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
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
  const isCompleted = task.status === "COMPLETED";
  const isRejected = task.status === "REJECTED";
  // const isPending = task.status === "PENDING_REVIEW"; // Không cần biến này nữa vì đã chia tab

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border p-4 transition-all mb-3 relative overflow-hidden group",
        // 1. Logic Active
        isActive 
          ? "border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-200 z-10" 
          : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md",
        
        // 2. Logic Completed/Rejected (Làm mờ nền)
        (isCompleted || isRejected) && !isActive && "bg-slate-50 border-slate-100 opacity-75 hover:opacity-100 grayscale-[0.2]"
      )}
    >
      {/* Vạch màu chỉ thị bên trái khi Active */}
      <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          isActive ? "bg-orange-500" : "bg-transparent"
      )} />

      {/* Header: Badge Type & Deadline */}
      <div className="flex items-center justify-between mb-2 pl-2">
        {/* [UPDATE] Luôn hiển thị Badge Type dù trạng thái nào */}
        <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded border uppercase", getTypeStyles(task.taskType))}>
            {getTypeLabel(task.taskType)}
        </span>
        
        {task.deadline && (
          <div className={cn("flex items-center text-xs", (isCompleted || isRejected) ? "text-slate-400" : "text-gray-500")}>
            <Clock className="w-3 h-3 mr-1" />
            <span>{format(new Date(task.deadline), "dd/MM/yyyy")}</span>
          </div>
        )}
      </div>

      {/* Body: Task Name */}
      <div className="pl-2 pr-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
                "text-sm font-semibold line-clamp-2",
                isActive ? "text-orange-900" : "text-gray-900",
                // Gạch ngang nếu đã xong
                isCompleted && "line-through text-slate-400 decoration-slate-300",
                isRejected && "text-red-800"
            )}>
                {task.taskName}
            </h4>
            
            {/* Icon chỉ thị trạng thái ở góc phải tên */}
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
            {isRejected && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
          </div>

          {/* Footer: Project Name */}
          <div className={cn("flex items-center text-xs mt-2", (isCompleted || isRejected) ? "text-slate-400" : "text-gray-500")}>
            <FolderOpen className="w-3 h-3 mr-1.5 flex-shrink-0" />
            <span className="truncate max-w-[200px]" title={task.projectName}>
            {task.projectName || "Không có dự án"}
            </span>
          </div>
      </div>
    </div>
  );
};