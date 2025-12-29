import { useEffect, useState } from "react";
import { Loader2, MessageCircleOff } from "lucide-react";
import { Comment, commentApi } from "@/entities/comment";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";
import { useToast } from "@/shared/lib/hooks/use-toast"; // Nếu có

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
      // Nếu là post bài mới (không phải reply) thì set loading cục bộ ở đây
      if (!parentId) setSubmitting(true);

      await commentApi.createComment(taskId, {
        content,
        parentId: parentId || null
      });

      // Reload lại list sau khi post thành công
      // (Cách này hơi tốn kém, tối ưu hơn là append vào state local, nhưng an toàn nhất)
      await fetchComments();
      
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi bình luận" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Form Post bài mới */}
      <div className="bg-gray-50 p-4 rounded-lg border border-dashed">
         <CommentInput 
            onSubmit={(content) => handlePostComment(content)} 
            loading={submitting}
         />
      </div>

      {/* 2. Danh sách Comment */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 flex flex-col items-center">
             <MessageCircleOff className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-sm">Chưa có thảo luận nào. Hãy bắt đầu!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={(parentId, content) => handlePostComment(content, parentId)}
            />
          ))
        )}
      </div>
    </div>
  );
};