"use client";

import { useEffect, useState } from "react";
import { Task, taskApi } from "@/entities/task"; 
import { TaskItem } from "./task-item"; 
import { Loader2, Search, CheckCircle } from "lucide-react"; 
import { Input } from "@/shared/ui/input";

interface ReviewTaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: number;
}

export const ReviewTaskList = ({ onSelectTask, selectedTaskId }: ReviewTaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. Gọi API Lấy danh sách cần duyệt ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Dữ liệu thô từ API (Dạng cây, lẫn lộn status)
        const rawData = await taskApi.getReviewerList();
        
        // [LOGIC DỌN DẸP] Làm phẳng mảng và chỉ lấy PENDING_REVIEW
        const cleanList: Task[] = [];

        // Hàm đệ quy để duyệt cây
        const flattenReviewTasks = (items: Task[]) => {
          items.forEach(item => {
            // 1. Kiểm tra chính nó: Nếu status là PENDING_REVIEW -> Lấy
            // (Lưu ý: Interceptor đã chuyển status thành chữ hoa chưa? Check kỹ log, thường là hoa)
            if (item.status === "PENDING_REVIEW") {
              cleanList.push(item);
            }

            // 2. Nếu nó có con (subTasks) -> Đào tiếp vào trong
            // Interceptor của bạn chuyển sub_tasks -> subTasks (camelCase)
            if (item.subTasks && item.subTasks.length > 0) {
              flattenReviewTasks(item.subTasks);
            }
          });
        };

        // Bắt đầu dọn dẹp
        flattenReviewTasks(rawData);

        // Set danh sách đã dọn dẹp vào state
        setTasks(cleanList);

      } catch (error) {
        console.error("Lỗi tải danh sách duyệt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- 2. Filter Client-side (Tìm kiếm trên danh sách đã dọn) ---
  const filteredTasks = tasks.filter(t => {
    const tName = t.taskName?.toLowerCase() || "";
    const pName = t.projectName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return tName.includes(search) || pName.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* ... (Phần Header giữ nguyên) ... */}
      <div className="p-4 border-b bg-orange-50 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5"/> CẦN DUYỆT
          </h2>
          <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-orange-400" />
          <Input 
            placeholder="Tìm theo tên hoặc dự án..." 
            className="pl-9 h-9 text-sm bg-white focus:ring-orange-500 border-orange-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
            <span className="text-sm font-medium">Đang tải hồ sơ...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {searchTerm ? "Không tìm thấy kết quả." : "Tuyệt vời! Bạn không có bài nào cần duyệt."}
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