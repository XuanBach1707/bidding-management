import { z } from "zod";
// Giả sử đường dẫn này đúng trong project của bạn
import { UserSchema, TokenSchema } from "@/shared/api/schema"; 

// 1. Schema cho Form Login (Validate input)
export const LoginInputSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  // [THÊM MỚI] Bắt buộc phải có để khớp với Checkbox
  rememberMe: z.boolean().optional().default(false), 
});

// 2. Type cho input
export type LoginInput = z.infer<typeof LoginInputSchema>;

// 3. Schema cho Response
export const AuthResponseSchema = z.object({
  ...TokenSchema.shape, 
  user: UserSchema,    
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;