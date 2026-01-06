import { useEffect, useState } from "react";
import { Task, taskApi } from "@/entities/task";
import { TaskItem } from "./task-item";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: number;
}

export const TaskList = ({ onSelectTask, selectedTaskId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch danh sách task được giao
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Gọi API List (Data nhẹ)
        const data = await taskApi.getAssignedTasks();
        setTasks(data);
        
        // [QUAN TRỌNG] 
        // KHÔNG ĐƯỢC auto-select task đầu tiên.
        // Lý do: Việc gọi API chi tiết sẽ kích hoạt BE đổi trạng thái task (Side Effect).
        // Chỉ gọi khi người dùng chủ động click.
        
        /* if (data.length > 0 && !selectedTaskId) {
             onSelectTask(data[0]);
        }
        */

      } catch (error) {
        console.error("Lỗi tải danh sách công việc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []); // Chỉ chạy 1 lần khi mount

  // 2. Client-side Filter
  const filteredTasks = tasks.filter(t => {
    const tName = t.taskName?.toLowerCase() || "";
    const pName = t.projectName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return tName.includes(search) || pName.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">DANH SÁCH</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-9 h-9 text-sm bg-gray-50 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
            <span className="text-sm font-medium">Đang tải nhiệm vụ...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {searchTerm ? "Không tìm thấy kết quả." : "Bạn chưa được giao nhiệm vụ nào."}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isActive={task.id === selectedTaskId}
                onClick={() => onSelectTask(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};