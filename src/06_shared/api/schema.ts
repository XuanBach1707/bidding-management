// Giả định: src/06_shared/schema/auth.schema.ts (hoặc tương tự)
import { z } from "zod";

// 1. UserRoleSchema (Cần tách ra để dùng trong use-auth)
export const UserRoleSchema = z.enum(["ADMIN", "MANAGER", "BID_MANAGER", "SPECIALIST", "ENGINEER"]);

// 2. UserSchema
export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email({ message: "Email không đúng định dạng" }),
  fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  avatarUrl: z.string().url().optional().nullable(),
  role: UserRoleSchema, // Dùng UserRoleSchema
});

// 3. TokenSchema
export const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(), // Thêm optional vì BE có thể thiếu
  expiresIn: z.number().optional(),     // Thêm optional
});

// 4. AuthResponseSchema (Cục JSON trả về sau khi Login)
export const AuthResponseSchema = TokenSchema.extend({
    user: UserSchema,
});


// 5. EXPORT TYPES
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;