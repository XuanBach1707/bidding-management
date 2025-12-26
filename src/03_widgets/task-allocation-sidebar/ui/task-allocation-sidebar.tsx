import { useEffect, useState } from "react";
import { Task, taskApi } from "@/entities/task";

interface TaskAllocationSidebarProps {
  currentTaskId: number | null;
  onSelectTask: (task: Task) => void;
  refreshKey: number; // Dùng để trigger reload danh sách khi có thay đổi từ bên ngoài
}

export const TaskAllocationSidebar = ({ 
  currentTaskId, 
  onSelectTask,
  refreshKey 
}: TaskAllocationSidebarProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm fetch dữ liệu
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskApi.getMyTasks();
      setTasks(data);
      
      // Nếu chưa chọn task nào và danh sách có dữ liệu, tự động chọn cái đầu tiên
      if (!currentTaskId && data.length > 0) {
        onSelectTask(data[0]);
      }
      
      // Nếu đang chọn một task, cần update lại data mới nhất của task đó (để thấy subtask mới tạo)
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
  }, [refreshKey]); // Reload khi refreshKey thay đổi

  return (
    <div className="w-[300px] border-r bg-white flex flex-col h-full">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wide">
          Gói thầu chờ giao
        </h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && tasks.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">Đang tải...</div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => {
              const isActive = task.id === currentTaskId;
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors border-l-4 ${
                    isActive 
                      ? "bg-blue-50 border-blue-600" 
                      : "border-transparent"
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-1 ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                    {task.taskName}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) : 'N/A'}
                    </span>
                    {/* Hiển thị số lượng subtask */}
                    {task.subTasks && task.subTasks.length > 0 && (
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                        {task.subTasks.length} việc
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {tasks.length === 0 && !isLoading && (
              <div className="p-4 text-sm text-gray-400 text-center">
                Không có gói thầu nào cần xử lý.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};