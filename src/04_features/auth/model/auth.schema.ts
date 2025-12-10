import { z } from "zod";
import { UserSchema, TokenSchema } from "@/shared/api/schema"; // Import cái có sẵn trong schema.ts cũ của bạn

// 1. Schema cho Form Login (Validate input)
export const LoginInputSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

// 2. Type cho input
export type LoginInput = z.infer<typeof LoginInputSchema>;

// 3. Schema cho Response trả về (Kết hợp Token + User)
// BE trả về một cục gồm cả Token và User, nên mình gộp lại
export const AuthResponseSchema = z.object({
  ...TokenSchema.shape, // Kế thừa accessToken, refreshToken...
  user: UserSchema,     // Kế thừa id, email, role...
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;