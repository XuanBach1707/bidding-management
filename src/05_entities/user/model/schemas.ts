// src/entities/user/model/schemas.ts
import { z } from "zod";
import { UserRole, SecurityLevel } from "./consts";

// 1. Schema hiển thị (GET)
export const UserSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.nativeEnum(UserRole),
  orgUnitId: z.number().nullable().optional(), 
  orgUnitName: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  securityClearance: z.nativeEnum(SecurityLevel),
  parentOrgUnitName: z.string().nullable().optional(),
  status: z.boolean(),
});

// 2. Schema Tạo mới (POST)
export const CreateUserSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  role: z.nativeEnum(UserRole).default(UserRole.ENGINEER),
  orgUnitId: z.number().optional().default(0),
  jobTitle: z.string().optional(),
  securityClearance: z.coerce.number().pipe(z.nativeEnum(SecurityLevel)).default(SecurityLevel.INTERNAL),
  status: z.boolean().default(true),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// 3. Schema Cập nhật (PUT)
export const UpdateUserSchema = CreateUserSchema.partial().omit({ 
  password: true, 
  email: true 
});

// =================================================================
// 4. [MỚI] SCHEMA ĐỔI MẬT KHẨU
// =================================================================

// 4.1. User tự đổi mật khẩu (Cần confirm)
export const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Lỗi sẽ hiện ở trường confirmPassword
});

// 4.2. Admin reset mật khẩu (Không cần confirm, vì admin set rồi gửi cho user)
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

// Export Type trực tiếp tại đây cũng được, hoặc sang file types.ts export (như cấu trúc bạn đang làm)
export type User = z.infer<typeof UserSchema>;
export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;