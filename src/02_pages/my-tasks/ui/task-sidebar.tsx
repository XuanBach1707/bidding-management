import { Task } from "@/entities/task";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import { CheckCircle2, Clock, FileSearch, PenTool, Briefcase } from "lucide-react";

interface TaskSidebarProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (task: Task) => void;
}

export const TaskSidebar = ({ tasks, selectedTaskId, onSelectTask }: TaskSidebarProps) => {
  return (
    <div className="w-80 bg-white border-r flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full">
      <div className="p-5 border-b bg-white">
        <h2 className="text-xs font-bold text-slate-500 uppercase flex justify-between items-center tracking-wider">
          Danh sách nhiệm vụ
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
            {tasks.length}
          </span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tasks.map((task) => {
          // Logic xác định loại task (giả định dựa trên tên hoặc field type từ BE)
          const isSelection = task.taskName.toLowerCase().includes("chọn") || task.taskName.toLowerCase().includes("lựa");
          const isActive = selectedTaskId === task.id;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all group border border-transparent",
                isActive 
                  ? "bg-blue-50/80 border-blue-100 shadow-sm" 
                  : "hover:bg-slate-50"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1.5 border",
                    isSelection 
                      ? "bg-sky-50 text-sky-700 border-sky-100" 
                      : "bg-purple-50 text-purple-700 border-purple-100"
                  )}
                >
                  {isSelection ? <FileSearch className="w-3 h-3" /> : <PenTool className="w-3 h-3" />}
                  {isSelection ? "Selection" : "Drafting"}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.deadline ? format(new Date(task.deadline), "dd/MM") : "--/--"}
                </span>
              </div>
              
              <h3 className={cn(
                "text-sm font-semibold line-clamp-2 leading-snug mb-1 transition-colors",
                isActive ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900"
              )}>
                {task.taskName}
              </h3>
              
              {/* <div className="flex items-center gap-1 text-xs text-slate-500">
                <Briefcase className="w-3 h-3" />
                <span className="truncate max-w-[180px]"></span>
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};