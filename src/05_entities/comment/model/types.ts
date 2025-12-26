import { z } from "zod";
import { CreateCommentSchema } from "./schemas";

// 1. DTO cho API Request
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

// 2. Interface cho Author (Người tạo comment)
export interface CommentAuthor {
  user_id: number;
  full_name: string;
}

// 3. Interface cho Comment (Response từ API)
export interface Comment {
  id: number;
  task_id: number;
  content: string;
  created_at: string; // ISO Date string
  author: CommentAuthor;
  replies: Comment[]; // Đệ quy: Comment con cũng có cấu trúc y hệt
}