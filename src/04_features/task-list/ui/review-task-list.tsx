"use client";

import { useEffect, useState, useMemo } from "react";
import { Task, taskApi } from "@/entities/task"; 
import { TaskItem } from "./task-item"; 
import { Loader2, Search, FileCheck2, Clock, History } from "lucide-react"; 
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

interface ReviewTaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: number;
}

export const ReviewTaskList = ({ onSelectTask, selectedTaskId }: ReviewTaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const rawData = await taskApi.getReviewerList();
        
        const cleanList: Task[] = [];
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

  const { pendingTasks, historyTasks } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    const isMatch = (t: Task) => {
        const tName = t.taskName?.toLowerCase() || "";
        const pName = t.projectName?.toLowerCase() || "";
        return tName.includes(searchLower) || pName.includes(searchLower);
    };

    const pending: Task[] = [];
    const history: Task[] = [];

    tasks.forEach(t => {
        if (!isMatch(t)) return;
        if (t.status === 'PENDING_REVIEW') {
            pending.push(t);
        } else if (['COMPLETED', 'REJECTED'].includes(t.status)) {
            history.push(t);
        }
    });

    return { pendingTasks: pending, historyTasks: history };
  }, [tasks, searchTerm]);


  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#009d98] flex items-center gap-2 mb-4">
           <div className="p-1.5 bg-[#009d98]/10 rounded-lg">
                <FileCheck2 className="w-5 h-5"/> 
           </div>
           DUYỆT HỒ SƠ
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3">
            <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-lg h-9">
                <TabsTrigger 
                  value="pending" 
                  className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#009d98] data-[state=active]:shadow-sm transition-all"
                >
                    Cần duyệt 
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#009d98]/10 text-[#009d98] text-[10px]">
                      {pendingTasks.length}
                    </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm transition-all"
                >
                    Lịch sử
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                      {historyTasks.length}
                    </span>
                </TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm hồ sơ..." 
            className="pl-9 h-9 text-sm bg-slate-50 focus:bg-white focus:ring-[#009d98] border-slate-200"
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
            <span className="text-sm font-medium">Đang tải hồ sơ...</span>
          </div>
        ) : (
            <div className="space-y-2 animate-in fade-in duration-300">
                {activeTab === 'pending' && (
                    pendingTasks.length === 0 ? (
                        <EmptyState icon={Clock} message={searchTerm ? "Không tìm thấy kết quả." : "Không có bài cần duyệt."} />
                    ) : (
                        pendingTasks.map((task) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                isActive={task.id === selectedTaskId}
                                onClick={() => onSelectTask(task)}
                            />
                        ))
                    )
                )}

                {activeTab === 'history' && (
                    historyTasks.length === 0 ? (
                        <EmptyState icon={History} message={searchTerm ? "Không tìm thấy kết quả." : "Chưa có lịch sử duyệt bài."} />
                    ) : (
                        historyTasks.map((task) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                isActive={task.id === selectedTaskId}
                                onClick={() => onSelectTask(task)}
                            />
                        ))
                    )
                )}
            </div>
        )}
      </div>
    </div>
  );
};

// Helper component cho gọn
const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
    <div className="text-center py-12 text-slate-400 flex flex-col items-center">
        <div className="p-3 bg-slate-100 rounded-full mb-3">
            <Icon className="w-6 h-6 text-slate-300" />
        </div>
        <span className="text-sm font-medium">{message}</span>
    </div>
);