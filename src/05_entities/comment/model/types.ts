import { z } from "zod";
import { CreateCommentSchema } from "./schemas";

// 1. DTO cho API Request
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

// 2. Interface cho Author
export interface CommentAuthor {
  userId: number;      // Đã sửa từ user_id
  fullName: string;    // Đã sửa từ full_name
}

// 3. Interface cho Comment
export interface Comment {
  id: number;
  taskId: number;      // Đã sửa từ task_id
  content: string;
  createdAt: string;   // Đã sửa từ created_at
  author: CommentAuthor;
  replies: Comment[];  // Đệ quy
}