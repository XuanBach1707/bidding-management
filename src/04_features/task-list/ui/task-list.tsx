import { useEffect, useState } from "react";
import { Task, taskApi } from "@/entities/task";
import { TaskItem } from "./task-item";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/shared/ui/input"; // Giả sử có Input component

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
        const data = await taskApi.getAssignedTasks();
        setTasks(data);
        
        // Tự động chọn task đầu tiên nếu chưa chọn gì
        if (data.length > 0 && !selectedTaskId) {
            // Logic tùy chọn: onSelectTask(data[0]);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách công việc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []); // Chỉ chạy 1 lần khi mount

  // 2. Client-side Filter (Tìm kiếm theo tên)
  const filteredTasks = tasks.filter(t => 
    t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header: Title & Count & Search */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">DANH SÁCH NHIỆM VỤ</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Tìm kiếm công việc..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">Đang tải nhiệm vụ...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Không tìm thấy công việc nào.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isActive={task.id === selectedTaskId}
              onClick={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </div>
  );
};