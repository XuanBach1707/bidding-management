import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, CornerDownRight } from "lucide-react";
import { Comment } from "@/entities/comment";
import { CommentInput } from "./comment-input";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number, content: string) => Promise<void>;
}

export const CommentItem = ({ comment, onReply }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async (content: string) => {
    setIsSubmitting(true);
    await onReply(comment.id, content);
    setIsSubmitting(false);
    setIsReplying(false);
  };

  // Lấy chữ cái đầu tên để làm Avatar
  const initial = comment.author.fullName.charAt(0).toUpperCase();

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300 group/item">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8 border border-slate-100 bg-slate-50 text-slate-500 font-bold">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        {/* Content Bubble */}
        <div className="bg-slate-50/80 p-3 rounded-2xl rounded-tl-none border border-slate-100 hover:bg-white hover:border-[#009d98]/20 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-slate-800">
              {comment.author.fullName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        </div>

        {/* Action Footer */}
        <div className="mt-1 flex items-center gap-4 pl-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="text-[11px] font-bold text-slate-400 hover:text-[#009d98] flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Trả lời
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 pl-2 border-l-2 border-[#009d98]/20 ml-2">
             <CommentInput 
               placeholder={`Trả lời ${comment.author.fullName}...`}
               onSubmit={handleSubmitReply}
               onCancel={() => setIsReplying(false)}
               loading={isSubmitting}
             />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 ml-2 pl-3 border-l-2 border-slate-100 relative">
            {/* Guide line decoration */}
            <div className="absolute -left-[2px] top-0 h-4 w-4 border-b-2 border-l-2 border-slate-100 rounded-bl-xl -translate-y-2 pointer-events-none opacity-50" />
            
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                onReply={onReply} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};