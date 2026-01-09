import { useEffect, useState } from "react";
import { Task, taskApi } from "@/entities/task";
import { TaskItem } from "./task-item";
import { Loader2, Search, ListTodo } from "lucide-react"; // Icon mới
import { Input } from "@/shared/ui/input";

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: number;
}

export const TaskList = ({ onSelectTask, selectedTaskId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await taskApi.getAssignedTasks();
        setTasks(data);
      } catch (error) {
        console.error("Lỗi tải danh sách công việc:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const tName = t.taskName?.toLowerCase() || "";
    const pName = t.projectName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return tName.includes(search) || pName.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
             <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <ListTodo className="w-5 h-5"/>
             </div>
             CÔNG VIỆC
          </h2>
          <span className="bg-[#009d98]/10 text-[#009d98] text-xs font-bold px-2.5 py-1 rounded-full border border-[#009d98]/20">
            {filteredTasks.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm công việc..." 
            className="pl-9 h-9 text-sm bg-slate-50 focus:bg-white focus:ring-[#009d98] border-slate-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 bg-slate-50/30 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#009d98]" />
            <span className="text-sm font-medium">Đang tải nhiệm vụ...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center">
            <div className="p-3 bg-slate-100 rounded-full mb-3">
                <ListTodo className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-sm font-medium">{searchTerm ? "Không tìm thấy kết quả." : "Danh sách trống."}</span>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in duration-300">
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