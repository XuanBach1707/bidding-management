"use client";

import { useEffect, useState, useMemo } from "react";
import { Task, taskApi } from "@/entities/task"; 
import { TaskItem } from "./task-item"; 
import { Loader2, Search, CheckCircle, Clock, History } from "lucide-react"; 
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; // Nhớ import Tabs

interface ReviewTaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: number;
}

export const ReviewTaskList = ({ onSelectTask, selectedTaskId }: ReviewTaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Tab mặc định là 'pending'
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const rawData = await taskApi.getReviewerList();
        
        const cleanList: Task[] = [];

        // Hàm đệ quy duyệt cây (Lấy Leaf Node)
        const flattenTasks = (items: Task[]) => {
          items.forEach(item => {
            const hasSubTasks = item.subTasks && item.subTasks.length > 0;
            if (!hasSubTasks) {
                cleanList.push(item);
            } else {
                flattenTasks(item.subTasks);
            }
          });
        };

        flattenTasks(rawData);
        
        // Sắp xếp: Mới nhất lên đầu (theo ID hoặc ngày tạo nếu có)
        cleanList.sort((a, b) => b.id - a.id);

        setTasks(cleanList);

      } catch (error) {
        console.error("Lỗi tải danh sách duyệt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- LOGIC PHÂN LOẠI & LỌC ---
  const { pendingTasks, historyTasks } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    // Hàm search chung
    const isMatch = (t: Task) => {
        const tName = t.taskName?.toLowerCase() || "";
        const pName = t.projectName?.toLowerCase() || "";
        return tName.includes(searchLower) || pName.includes(searchLower);
    };

    const pending: Task[] = [];
    const history: Task[] = [];

    tasks.forEach(t => {
        if (!isMatch(t)) return;

        // Phân loại vào Tab
        if (t.status === 'PENDING_REVIEW') {
            pending.push(t);
        } else if (['COMPLETED', 'REJECTED'].includes(t.status)) {
            // Lấy những cái đã Duyệt hoặc Từ chối
            history.push(t);
        }
        // Những cái OPEN, IN_PROGRESS ta có thể bỏ qua ở màn hình Review này 
        // hoặc cho vào tab History nếu muốn xem tất cả. Tạm thời chỉ lấy Completed/Rejected.
    });

    return { pendingTasks: pending, historyTasks: history };
  }, [tasks, searchTerm]);


  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      
      {/* Header & Search */}
      <div className="p-4 border-b bg-orange-50 sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-3">
           <CheckCircle className="w-5 h-5"/> DUYỆT HỒ SƠ
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-orange-400" />
          <Input 
            placeholder="Tìm kiếm hồ sơ..." 
            className="pl-9 h-9 text-sm bg-white focus:ring-orange-500 border-orange-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Control */}
      <div className="px-2 pt-2 bg-gray-50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-gray-200/50 p-1 rounded-lg">
                  <TabsTrigger 
                    value="pending" 
                    className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm"
                  >
                      Cần duyệt 
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px]">
                        {pendingTasks.length}
                      </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm"
                  >
                      Đã duyệt
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                        {historyTasks.length}
                      </span>
                  </TabsTrigger>
              </TabsList>
          </Tabs>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
            <span className="text-sm font-medium">Đang tải hồ sơ...</span>
          </div>
        ) : (
            // Dùng logic hiển thị điều kiện dựa trên Active Tab
            <>
                {activeTab === 'pending' && (
                    pendingTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            {searchTerm ? "Không tìm thấy kết quả." : "Không có bài cần duyệt."}
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                            {pendingTasks.map((task) => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    isActive={task.id === selectedTaskId}
                                    onClick={() => onSelectTask(task)}
                                />
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'history' && (
                    historyTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            {searchTerm ? "Không tìm thấy kết quả." : "Chưa có lịch sử duyệt bài."}
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            {historyTasks.map((task) => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    isActive={task.id === selectedTaskId}
                                    onClick={() => onSelectTask(task)}
                                />
                            ))}
                        </div>
                    )
                )}
            </>
        )}
      </div>
    </div>
  );
};