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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/shared/ui/tooltip"; // Giả sử bạn có tooltip, nếu không có thể dùng title HTML cơ bản

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

  // Effect: Tự động mở Group chứa task đang được chọn (currentTaskId)
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
  }, [currentTaskId, tasks]); // Chỉ chạy khi danh sách task hoặc selection thay đổi

  // Hàm toggle đóng/mở dự án
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
    <div className="w-[320px] border-r bg-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      {/* HEADER */}
      <div className="p-4 border-b bg-white shrink-0">
        <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wide flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          Nhiệm vụ cần phân bổ
        </h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
             <span className="text-xs">Đang tải dữ liệu...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
             Không có công việc nào.
          </div>
        ) : (
          groupedTasks.map((group) => {
            const isExpanded = expandedProjects.has(group.projectId);

            return (
              <div key={group.projectId} className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden select-none">
                
                {/* --- PROJECT HEADER (Clickable) --- */}
                <div 
                    onClick={() => toggleProject(group.projectId)}
                    className={cn(
                        "px-3 py-2.5 cursor-pointer flex items-center gap-2 transition-colors",
                        isExpanded ? "bg-gray-50 border-b border-gray-100" : "bg-white hover:bg-gray-50"
                    )}
                    // Fallback title native nếu không dùng Tooltip component
                    title={group.projectName} 
                >
                    {/* Icon mũi tên xoay */}
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}

                    {/* Icon Folder */}
                    {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                        <Folder className="w-4 h-4 text-gray-400 shrink-0" />
                    )}

                    {/* Tên dự án: 1 dòng + ... */}
                    <span className="text-xs font-bold text-gray-700 uppercase truncate flex-1">
                        {group.projectName}
                    </span>
                    
                    {/* Số lượng task (Badge nhỏ) */}
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded-full font-medium shrink-0">
                        {group.tasks.length}
                    </span>
                </div>

                {/* --- TASKS LIST (Collapsible) --- */}
                {isExpanded && (
                    <div className="bg-gray-50/50 py-1">
                        {group.tasks.map((task) => {
                            const isActive = task.id === currentTaskId;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectTask(task)}
                                    className={cn(
                                        "relative cursor-pointer transition-all pl-9 pr-3 py-2.5", // pl-9 để thụt vào
                                        "border-l-[3px]", // Viền trái chỉ trạng thái
                                        isActive 
                                            ? "bg-blue-50/80 border-blue-600" 
                                            : "border-transparent hover:bg-gray-100 hover:border-gray-300"
                                    )}
                                >
                                    {/* Tên Task */}
                                    <h3 className={cn(
                                        "text-xs font-medium leading-snug mb-1.5 line-clamp-2",
                                        isActive ? "text-blue-700" : "text-gray-700"
                                    )}>
                                        {task.taskName}
                                    </h3>

                                    {/* Meta info */}
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-[10px] flex items-center gap-1",
                                            isActive ? "text-blue-500" : "text-gray-400"
                                        )}>
                                            <Clock className="w-3 h-3" />
                                            {task.deadline 
                                                ? new Date(task.deadline).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) 
                                                : '--/--'}
                                        </span>

                                        {task.subTasks && task.subTasks.length > 0 && (
                                            <span className="text-[10px] bg-white border px-1 rounded text-gray-500 flex items-center gap-1">
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