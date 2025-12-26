import { http } from "@/shared/api";
import { Comment, CreateCommentDto } from "../model/types";

export const commentApi = {
  /**
   * Lấy danh sách bình luận của một Task
   * GET /tasks/{taskId}/comments
   */
  getComments: (taskId: number | string): Promise<Comment[]> => {
    return http.get(`/tasks/${taskId}/comments`);
  },

  /**
   * Tạo bình luận mới (hoặc trả lời bình luận)
   * POST /tasks/{taskId}/comments
   */
  createComment: (taskId: number | string, payload: CreateCommentDto): Promise<Comment> => {
    return http.post(`/tasks/${taskId}/comments`, payload);
  },
};