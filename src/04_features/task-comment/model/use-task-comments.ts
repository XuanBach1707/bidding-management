import { useState, useEffect } from "react";
import { commentApi, Comment, CreateCommentDto } from "@/entities/comment";
import { useToast } from "@/shared/lib/hooks/use-toast";

export const useTaskComments = (taskId?: number) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load comments khi taskId thay đổi
  useEffect(() => {
    if (!taskId) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const data = await commentApi.getComments(taskId);
        setComments(data);
      } catch (error) {
        console.error("Lỗi tải bình luận:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [taskId]);

  // Gửi comment mới
  const sendComment = async (content: string, parentId?: number) => {
    if (!taskId || !content.trim()) return;

    setIsSending(true);
    try {
      const payload: CreateCommentDto = {
        content: content,
        parentId: parentId || null,
      };

      const newComment = await commentApi.createComment(taskId, payload);
      
      // Cập nhật list local ngay lập tức
      setComments((prev) => [newComment, ...prev]); 
      
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi bình luận." });
    } finally {
      setIsSending(false);
    }
  };

  return { comments, isLoading, isSending, sendComment };
};