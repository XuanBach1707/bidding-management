"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Bot, FileText, File } from "lucide-react";
import { http } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";

// [FIX 1]: Cập nhật Interface theo camelCase (do Interceptor convert từ task_name -> taskName)
interface DraftItem {
  id: number;
  taskName: string; 
}

export const QuickAccessWidget = () => {
  const router = useRouter();
  
  // State cho AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // State cho Drafts
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  // --- LOGIC 1: Lấy danh sách Draft ---
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoadingDrafts(true);
        // Gọi API: GET /drafting/my-drafts
        // Interceptor sẽ trả về mảng object đã convert key sang camelCase
        const res: any = await http.get<DraftItem[]>("/drafting/my-drafts");
        
        // Kiểm tra an toàn dữ liệu trả về
        const data = Array.isArray(res) ? res : res?.data || [];
        
        if (Array.isArray(data)) {
          setDrafts(data.slice(0, 5)); // Lấy 5 bản nháp mới nhất
        }
      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
      } finally {
        setLoadingDrafts(false);
      }
    };
    fetchDrafts();
  }, []);

  // --- LOGIC 2: Điều hướng [FIX QUAN TRỌNG] ---
  const handleNavigateToWorkspace = (taskId: number) => {
    // Chuyển hướng sang trang MyTasks và gắn taskId vào URL
    // Trang MyTasks sẽ đọc param này và tự động mở TaskDetailPanel
    router.push(`/my-tasks?taskId=${taskId}`); 
  };

  // --- LOGIC 3: AI Assistant ---
  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res: any = await http.post("/drafting/ai-assist", { 
        prompt: aiPrompt,
        context: "dashboard_quick_chat" 
      });
      alert(`AI Trả lời: ${res?.answer || "Đã nhận yêu cầu"}`);
      setAiPrompt("");
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* --- AI WIDGET --- */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-200 p-5 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h3 className="font-bold text-lg tracking-tight">Trợ lý AI</h3>
          </div>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            Hỗ trợ soạn thảo, tóm tắt và phân tích hồ sơ thầu.
          </p>
          <div className="relative">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              placeholder={isAiLoading ? "Đang xử lý..." : "Nhập yêu cầu..."}
              disabled={isAiLoading}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white placeholder:text-blue-200 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button 
              onClick={handleAiAsk}
              disabled={isAiLoading}
              className="absolute right-1 top-1 p-1.5 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors shadow-sm"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <Bot className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* --- RECENT DRAFTS WIDGET --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
             <FileText className="w-4 h-4 text-slate-500" />
             Tiếp tục làm việc
           </h3>
        </div>

        <div className="space-y-3">
          {loadingDrafts ? (
            // Skeleton Loading
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : drafts.length > 0 ? (
            // List Real Data
            drafts.map((draft) => (
              <div 
                key={draft.id} 
                onClick={() => handleNavigateToWorkspace(draft.id)}
                className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg -mx-2 transition-colors"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-100 text-blue-600 border border-blue-200">
                  <File className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* [FIX 2]: Sử dụng taskName thay vì task_name */}
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                    {draft.taskName || "Bản nháp không tên"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    ID: {draft.id} • Nhấn để mở
                  </p>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center text-xs text-slate-400 py-4">
               Bạn chưa có bản nháp nào.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};