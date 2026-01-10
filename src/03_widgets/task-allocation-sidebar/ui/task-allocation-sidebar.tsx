import { useEffect, useState, useMemo } from "react";
import { Task, taskApi } from "@/entities/task";
import { 
  Folder, 
  FolderOpen, 
  Briefcase, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
// Nếu chưa có Tooltip component thì dùng title native, ở đây giữ nguyên import nếu dự án có sẵn
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/shared/ui/tooltip"; 

interface TaskAllocationSidebarProps {
  currentTaskId: number | null;
  onSelectTask: (task: Task) => void;
  refreshKey: number;
}

interface ProjectGroup {
  projectId: number;
  projectName: string;
  tasks: Task[];
}

export const TaskAllocationSidebar = ({ 
  currentTaskId, 
  onSelectTask,
  refreshKey 
}: TaskAllocationSidebarProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State quản lý danh sách các dự án đang mở (expanded)
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // --- 1. FETCH DATA ---
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskApi.getMyTasks();
      setTasks(data);
      
      // Tự động chọn task đầu tiên nếu chưa chọn
      if (!currentTaskId && data.length > 0) {
        onSelectTask(data[0]);
      }
      
      // Update data cho task đang chọn
      if (currentTaskId) {
        const updatedCurrentTask = data.find(t => t.id === currentTaskId);
        if (updatedCurrentTask) {
          onSelectTask(updatedCurrentTask);
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách công việc:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // --- 2. GOM NHÓM & AUTO EXPAND ---
  const groupedTasks = useMemo(() => {
    const groups: Record<number, ProjectGroup> = {};

    tasks.forEach((task) => {
      const pId = task.biddingProjectId || 0;
      const pName = task.projectName || "Công việc khác";

      if (!groups[pId]) {
        groups[pId] = { projectId: pId, projectName: pName, tasks: [] };
      }
      groups[pId].tasks.push(task);
    });
    
    return Object.values(groups);
  }, [tasks]);

  // Effect: Tự động mở Group chứa task đang được chọn
  useEffect(() => {
    if (currentTaskId && tasks.length > 0) {
      const activeTask = tasks.find(t => t.id === currentTaskId);
      if (activeTask) {
        const pId = activeTask.biddingProjectId || 0;
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            newSet.add(pId);
            return newSet;
        });
      }
    } else if (tasks.length > 0 && expandedProjects.size === 0) {
         // Mặc định mở nhóm đầu tiên nếu chưa mở gì
         const firstTask = tasks[0];
         const firstPId = firstTask.biddingProjectId || 0;
         setExpandedProjects(new Set([firstPId]));
    }
  }, [currentTaskId, tasks]);

  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // --- 3. RENDER ---
  return (
    <div className="w-[320px] border-r border-slate-200 bg-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 bg-white shrink-0">
        <h2 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#009d98]" />
          Nhiệm vụ cần phân bổ
        </h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
             <div className="w-5 h-5 border-2 border-[#009d98] border-t-transparent animate-spin rounded-full"></div>
             <span className="text-xs font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm italic">
             Không có công việc nào.
          </div>
        ) : (
          groupedTasks.map((group) => {
            const isExpanded = expandedProjects.has(group.projectId);

            return (
              <div key={group.projectId} className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden select-none">
                
                {/* --- PROJECT HEADER (Clickable) --- */}
                <div 
                    onClick={() => toggleProject(group.projectId)}
                    className={cn(
                        "px-3 py-2.5 cursor-pointer flex items-center gap-2 transition-colors",
                        isExpanded ? "bg-slate-50 border-b border-slate-100" : "bg-white hover:bg-slate-50"
                    )}
                    title={group.projectName} 
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}

                    {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-[#009d98] shrink-0" />
                    ) : (
                        <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                    )}

                    <span className="text-xs font-bold text-slate-700 uppercase truncate flex-1 tracking-tight">
                        {group.projectName}
                    </span>
                    
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold shrink-0 min-w-[20px] text-center">
                        {group.tasks.length}
                    </span>
                </div>

                {/* --- TASKS LIST (Collapsible) --- */}
                {isExpanded && (
                    <div className="bg-slate-50/30 py-1">
                        {group.tasks.map((task) => {
                            const isActive = task.id === currentTaskId;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectTask(task)}
                                    className={cn(
                                        "relative cursor-pointer transition-all pl-9 pr-3 py-2.5 mx-1 rounded-md mb-0.5 group",
                                        isActive 
                                            ? "bg-[#009d98]/10 text-[#009d98]" 
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    {/* Indicator Pattern Chuẩn */}
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-2/3 bg-[#009d98] rounded-r-md" />
                                    )}

                                    <h3 className={cn(
                                        "text-xs font-semibold leading-snug mb-1.5 line-clamp-2",
                                        isActive ? "text-[#009d98]" : "text-slate-700 group-hover:text-slate-900"
                                    )}>
                                        {task.taskName}
                                    </h3>

                                    <div className="flex items-center gap-3 opacity-90">
                                        <span className={cn(
                                            "text-[10px] flex items-center gap-1 font-medium",
                                            isActive ? "text-[#009d98]" : "text-slate-400"
                                        )}>
                                            <Clock className="w-3 h-3" />
                                            {task.deadline 
                                                ? new Date(task.deadline).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) 
                                                : '--/--'}
                                        </span>

                                        {task.subTasks && task.subTasks.length > 0 && (
                                            <span className={cn(
                                                "text-[10px] px-1 rounded flex items-center gap-1 font-bold",
                                                isActive ? "bg-white/50 text-[#009d98]" : "bg-white border border-slate-200 text-slate-500"
                                            )}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                {task.subTasks.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};