import { useEffect, useState } from "react";
import { Loader2, MessageCircle, MessageCircleOff } from "lucide-react";
import { Comment, commentApi } from "@/entities/comment";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";
import { useToast } from "@/shared/lib/hooks/use-toast"; 

interface DiscussionThreadProps {
  taskId: number;
}

export const DiscussionThread = ({ taskId }: DiscussionThreadProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const data = await commentApi.getComments(taskId);
      setComments(data);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handlePostComment = async (content: string, parentId?: number) => {
    try {
      if (!parentId) setSubmitting(true);

      await commentApi.createComment(taskId, {
        content,
        parentId: parentId || null
      });

      await fetchComments();
      
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi bình luận" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#009d98]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-3xl mx-auto">
      
      {/* 1. Header (Optional) */}
      <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
         <MessageCircle className="w-5 h-5 text-[#009d98]" />
         <h3 className="font-bold text-sm uppercase tracking-wide">Thảo luận ({comments.length})</h3>
      </div>

      {/* 2. Danh sách Comment */}
      <div className="space-y-6 min-h-[200px]">
        {comments.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
             <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                <MessageCircleOff className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-sm text-slate-500 font-medium">Chưa có thảo luận nào.</p>
             <p className="text-xs text-slate-400">Hãy bắt đầu cuộc trò chuyện về công việc này.</p>
          </div>
        ) : (
          <div className="space-y-5">
             {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onReply={(parentId, content) => handlePostComment(content, parentId)}
                />
             ))}
          </div>
        )}
      </div>

      {/* 3. Form Post bài mới (Sticky Bottom hoặc ở cuối) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky bottom-0 z-10">
         <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Bình luận mới</p>
         <CommentInput 
            onSubmit={(content) => handlePostComment(content)} 
            loading={submitting}
            placeholder="Nhập nội dung thảo luận..."
         />
      </div>
    </div>
  );
};