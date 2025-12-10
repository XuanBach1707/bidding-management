import { z } from "zod";

// 1. Định nghĩa Schema cho người dùng (User)
// Tại sao làm cái này? Để dùng chung cho cả Login, Profile, Header...
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email({ message: "Email không đúng định dạng" }),
  fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  avatarUrl: z.string().url().optional().nullable(), // Có thể không có hoặc null
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]), // Chỉ chấp nhận 3 giá trị này
});

// 2. Định nghĩa Schema cho Token (Auth)
export const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// ==========================================
// 3. MAGIC HAPPENS HERE (Điều kỳ diệu nằm ở đây)
// Tự động tạo Type từ Schema trên. 
// Bạn KHÔNG CẦN viết "interface User { id: string... }" nữa.
// ==========================================
export type User = z.infer<typeof UserSchema>;
export type Token = z.infer<typeof TokenSchema>;