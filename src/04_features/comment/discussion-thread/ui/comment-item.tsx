import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, UserCircle } from "lucide-react";
import { Comment } from "@/entities/comment";
import { CommentInput } from "./comment-input";

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

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
      {/* Avatar Placeholder */}
      <div className="flex-shrink-0 mt-1">
        <UserCircle className="w-8 h-8 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Content Box */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm group hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-gray-900">
              {comment.author.fullName}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>

          {/* Action Footer */}
          <div className="mt-2 flex items-center gap-4">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              Trả lời
            </button>
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 pl-2 border-l-2 border-blue-100">
             <CommentInput 
               placeholder={`Trả lời ${comment.author.fullName}...`}
               onSubmit={handleSubmitReply}
               onCancel={() => setIsReplying(false)}
               loading={isSubmitting}
             />
          </div>
        )}

        {/* RECURSIVE: Render các comment con (Replies) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-gray-100">
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                onReply={onReply} // Truyền tiếp hàm reply xuống dưới
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};