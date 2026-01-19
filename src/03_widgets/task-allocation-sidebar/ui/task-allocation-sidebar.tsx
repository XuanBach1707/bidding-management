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
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  // --- 1. FETCH DATA ---
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskApi.getMyTasks();
      setTasks(data);
      
      // LOGIC MỚI: Chỉ tự động chọn task đầu tiên TRÊN DESKTOP.
      // Trên Mobile, ta muốn người dùng tự chọn để không bị nhảy trang bất ngờ.
      const isMobile = window.innerWidth < 768; 
      
      if (!currentTaskId && data.length > 0 && !isMobile) {
        onSelectTask(data[0]);
      }
      
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
         // Auto expand group đầu tiên
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
    // SỬA: Thay w-[320px] bằng w-full h-full. 
    // Chiều rộng thực tế sẽ do component cha (TaskAllocationPage) quyết định.
    <div className="w-full h-full flex flex-col bg-slate-50 md:bg-white">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-10">
        <h2 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#009d98]" />
          Nhiệm vụ cần phân bổ
        </h2>
        {/* Mobile Subtitle */}
        <p className="md:hidden text-[11px] text-slate-500 mt-1">
           Chọn một nhiệm vụ để bắt đầu phân công
        </p>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-50/50">
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
              <div key={group.projectId} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden select-none">
                
                {/* --- PROJECT HEADER --- */}
                <div 
                    onClick={() => toggleProject(group.projectId)}
                    className={cn(
                        "px-3 py-3 cursor-pointer flex items-center gap-3 transition-colors active:bg-slate-100", // Tăng vùng bấm py-3
                        isExpanded ? "bg-slate-50 border-b border-slate-100" : "bg-white"
                    )}
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

                    <span className="text-sm font-bold text-slate-700 uppercase truncate flex-1 tracking-tight">
                        {group.projectName}
                    </span>
                    
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                        {group.tasks.length}
                    </span>
                </div>

                {/* --- TASKS LIST --- */}
                {isExpanded && (
                    <div className="bg-slate-50/50 py-1">
                        {group.tasks.map((task) => {
                            const isActive = task.id === currentTaskId;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectTask(task)}
                                    // Sửa padding và margin để dễ bấm hơn trên mobile
                                    className={cn(
                                        "relative cursor-pointer transition-all pl-10 pr-4 py-3 md:py-2.5 mx-1 md:mx-1 rounded-md mb-0.5 group active:scale-[0.98]",
                                        isActive 
                                            ? "bg-[#009d98]/10 text-[#009d98]" 
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white md:bg-transparent shadow-sm md:shadow-none border md:border-none border-slate-100" // Mobile có nền trắng cho task
                                    )}
                                >
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-2/3 bg-[#009d98] rounded-r-md" />
                                    )}

                                    <h3 className={cn(
                                        "text-sm md:text-xs font-semibold leading-snug mb-1.5 line-clamp-2",
                                        isActive ? "text-[#009d98]" : "text-slate-700 group-hover:text-slate-900"
                                    )}>
                                        {task.taskName}
                                    </h3>

                                    <div className="flex items-center gap-3 opacity-90">
                                        <span className={cn(
                                            "text-xs md:text-[10px] flex items-center gap-1 font-medium",
                                            isActive ? "text-[#009d98]" : "text-slate-400"
                                        )}>
                                            <Clock className="w-3.5 h-3.5 md:w-3 md:h-3" />
                                            {task.deadline 
                                                ? new Date(task.deadline).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) 
                                                : '--/--'}
                                        </span>

                                        {task.subTasks && task.subTasks.length > 0 && (
                                            <span className={cn(
                                                "text-xs md:text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold",
                                                isActive ? "bg-white/50 text-[#009d98]" : "bg-slate-100 border border-slate-200 text-slate-500"
                                            )}>
                                                <CheckCircle2 className="w-3.5 h-3.5 md:w-3 md:h-3" />
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