import { useState } from "react";
import { useTaskComments } from "../model/use-task-comments";

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
    <div className="flex flex-col h-full border-t pt-4 mt-2">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>💬 Thảo luận</span>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{comments.length}</span>
      </h3>

      {/* INPUT */}
      <div className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
          Me
        </div>
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết thảo luận... (Nhấn Enter để gửi)"
            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-[60px]"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="absolute bottom-2 right-2 p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      {/* LIST COMMENTS */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[300px]">
        {isLoading ? (
          <p className="text-xs text-gray-400 text-center">Đang tải bình luận...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center italic">Chưa có thảo luận nào.</p>
        ) : (
          comments.map((cmt) => (
            <div key={cmt.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                {cmt.author?.full_name?.charAt(0) || "U"}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {cmt.author?.full_name || `User ${cmt.author?.user_id}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(cmt.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-0.5 bg-gray-50 p-2 rounded-md inline-block max-w-full break-words">
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