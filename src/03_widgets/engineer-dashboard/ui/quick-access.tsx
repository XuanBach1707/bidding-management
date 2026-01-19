"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Bot, FileText, File } from "lucide-react";
import { http } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";

interface DraftItem {
  id: number;
  taskName: string; 
}

export const QuickAccessWidget = () => {
  const router = useRouter();
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoadingDrafts(true);
        const res: any = await http.get<DraftItem[]>("/drafting/my-drafts");
        const data = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(data)) {
          setDrafts(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Lỗi tải tài liệu:", error);
      } finally {
        setLoadingDrafts(false);
      }
    };
    fetchDrafts();
  }, []);

  const handleNavigateToWorkspace = (taskId: number) => {
    router.push(`/my-tasks?taskId=${taskId}`); 
  };

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

  // Mobile: space-y-4. PC: space-y-6
  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* --- AI WIDGET --- */}
      {/* Mobile: p-5. PC: p-6 */}
      <div className="bg-gradient-to-br from-[#009d98] to-[#007a76] rounded-xl shadow-lg shadow-[#009d98]/20 p-5 md:p-6 text-white relative overflow-hidden group transition-all hover:shadow-[#009d98]/40">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <h3 className="font-bold text-lg tracking-tight">Trợ lý AI</h3>
          </div>
          <p className="text-white/90 text-sm mb-4 md:mb-5 leading-relaxed font-medium">
            Hỗ trợ soạn thảo, tóm tắt và phân tích hồ sơ thầu.
          </p>
          <div className="relative group/input">
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              placeholder={isAiLoading ? "Đang xử lý..." : "Hỏi nhanh AI..."}
              disabled={isAiLoading}
              // Font size 16px (text-base) on mobile to prevent iOS zoom
              className="w-full bg-white/10 border border-white/30 rounded-lg pl-4 pr-12 py-3 text-base md:text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all shadow-inner"
            />
            <button 
              onClick={handleAiAsk}
              disabled={isAiLoading}
              className="absolute right-1.5 top-1.5 p-1.5 bg-white text-[#009d98] rounded-md hover:bg-white/90 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Decor */}
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute top-4 right-4 p-3 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
          <Bot className="w-20 h-20 text-white" />
        </div>
      </div>

      {/* --- RECENT DRAFTS --- */}
      {/* Giữ nguyên chiều cao để đồng bộ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 flex flex-col h-[300px]">
        <div className="flex justify-between items-center mb-3 md:mb-4 pb-2 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
             <div className="p-1.5 bg-slate-100 rounded-md">
                <FileText className="w-4 h-4 text-slate-500" />
             </div>
             Tiếp tục làm việc
           </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
          {loadingDrafts ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : drafts.length > 0 ? (
            drafts.map((draft) => (
              <div 
                key={draft.id} 
                onClick={() => handleNavigateToWorkspace(draft.id)}
                className="flex items-center gap-3 cursor-pointer group p-2 md:p-3 hover:bg-[#009d98]/5 rounded-lg border border-transparent hover:border-[#009d98]/20 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-white group-hover:text-[#009d98] group-hover:border-[#009d98]/30 transition-colors">
                  <File className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#009d98] transition-colors">
                    {draft.taskName || "Bản nháp không tên"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    ID: {draft.id}
                  </p>
                </div>
                {/* Ẩn mũi tên trên mobile cho đỡ chật */}
                <ArrowRight className="hidden md:block w-4 h-4 text-slate-300 group-hover:text-[#009d98] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-xs italic">Bạn chưa có bản nháp nào.</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};