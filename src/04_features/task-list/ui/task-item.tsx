import { format } from "date-fns"; 
import { Clock, CheckCircle2, FolderOpen, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Task, TaskType } from "@/entities/task"; 

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onClick: () => void;
}

const getTypeStyles = (type: TaskType) => {
  switch (type) {
    case TaskType.DRAFTING: return "bg-purple-50 text-purple-700 border-purple-200";
    case TaskType.SELECTION: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case TaskType.AUTO: return "bg-blue-50 text-blue-700 border-blue-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export const TaskItem = ({ task, isActive, onClick }: TaskItemProps) => {
  const isCompleted = task.status === "COMPLETED";
  const isRejected = task.status === "REJECTED";

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-3.5 transition-all duration-200 relative overflow-hidden group",
        // Active State: Teal Border & Shadow
        isActive 
          ? "border-[#009d98] bg-[#009d98]/5 shadow-sm ring-1 ring-[#009d98]" 
          : "border-slate-200 bg-white hover:border-[#009d98]/50 hover:shadow-md",
        
        // Completed/Rejected State: Dimmed
        (isCompleted || isRejected) && !isActive && "bg-slate-50 opacity-70 hover:opacity-100 grayscale-[0.5]"
      )}
    >
      {/* Header: Type & Deadline */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider", getTypeStyles(task.taskType))}>
            {task.taskType}
        </span>
        
        {task.deadline && (
          <div className={cn("flex items-center text-[11px] font-medium", 
              (isCompleted || isRejected) ? "text-slate-400" : "text-slate-500",
              // Highlight deadline nếu chưa xong
              (!isCompleted && !isRejected) && "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
          )}>
            <Clock className="w-3 h-3 mr-1" />
            <span>{format(new Date(task.deadline), "dd/MM")}</span>
          </div>
        )}
      </div>

      {/* Body: Name */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={cn(
            "text-sm font-bold line-clamp-2 leading-snug transition-colors",
            isActive ? "text-[#009d98]" : "text-slate-800",
            isCompleted && "line-through text-slate-400 decoration-slate-300",
            isRejected && "text-red-700 line-through decoration-red-200"
        )}>
            {task.taskName}
        </h4>
        
        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
        {isRejected && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
      </div>

      {/* Footer: Project */}
      <div className="flex items-center text-xs text-slate-500 border-t border-slate-100 pt-2 mt-2">
        <FolderOpen className="w-3 h-3 mr-1.5 flex-shrink-0 text-slate-400" />
        <span className="truncate max-w-[180px]" title={task.projectName}>
           {task.projectName || "Không có dự án"}
        </span>
      </div>
    </div>
  );
};