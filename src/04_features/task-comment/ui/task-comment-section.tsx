import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useTaskComments } from "../model/use-task-comments";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

interface TaskCommentSectionProps {
  taskId: number;
}

export const TaskCommentSection = ({ taskId }: TaskCommentSectionProps) => {
  const { comments, isLoading, isSending, sendComment } = useTaskComments(taskId);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendComment(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border-t border-slate-200 pt-6 mt-4">
      <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <MessageSquare className="w-4 h-4 text-[#009d98]" />
        <span>Thảo luận</span>
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold border border-slate-200">
            {comments.length}
        </span>
      </h3>

      {/* INPUT AREA */}
      <div className="flex gap-3 mb-6 items-start">
        <div className="w-9 h-9 rounded-full bg-[#009d98]/10 flex items-center justify-center text-xs font-bold text-[#009d98] border border-[#009d98]/20 shrink-0 mt-1">
          Me
        </div>
        <div className="flex-1 relative group">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết thảo luận... (Nhấn Enter để gửi)"
            className="min-h-[80px] w-full pr-12 text-sm bg-white focus:ring-[#009d98] focus:border-[#009d98] resize-none shadow-sm"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
                "absolute bottom-2 right-2 h-8 w-8 transition-all",
                inputValue.trim() ? "bg-[#009d98] hover:bg-[#008580] text-white" : "bg-slate-100 text-slate-300 hover:bg-slate-100"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* LIST COMMENTS */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 max-h-[400px] custom-scrollbar">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-4">Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
             <p className="text-sm text-slate-400 italic">Chưa có thảo luận nào.</p>
             <p className="text-xs text-slate-300 mt-1">Hãy là người đầu tiên bắt đầu cuộc trò chuyện.</p>
          </div>
        ) : (
          comments.map((cmt) => (
            <div key={cmt.id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 border border-slate-200 mt-0.5">
                {cmt.author?.fullName?.charAt(0) || "U"}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800">
                    {cmt.author?.fullName || `User ${cmt.author?.userId}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(cmt.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100 inline-block max-w-full break-words shadow-sm group-hover:border-slate-200 transition-colors">
                  {cmt.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};