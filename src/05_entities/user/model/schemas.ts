// src/entities/user/model/schemas.ts
import { z } from "zod";
import { UserRole, SecurityLevel } from "./consts";

// 1. Schema hiển thị (GET) - Khớp với API Response đã qua Interceptor (camelCase)
export const UserSchema = z.object({
  // API trả về user_id -> Interceptor đổi thành userId
  userId: z.number(),
  
  email: z.string().email(),
  
  // API: full_name -> fullName
  fullName: z.string(),
  
  // Enum Role
  role: z.nativeEnum(UserRole),
  
  // API: org_unit_id -> orgUnitId
  orgUnitId: z.number().nullable().optional(), 
  
  // API: org_unit_name -> orgUnitName
  orgUnitName: z.string().nullable().optional(),
  
  jobTitle: z.string().nullable().optional(),
  
  securityClearance: z.nativeEnum(SecurityLevel),
  parentOrgUnitName: z.string().nullable().optional(),
  
  // API: status -> status (Bạn muốn dùng isActive thì phải map tay, nhưng nên dùng status cho khớp DB)
  status: z.boolean(),
});

// 2. Schema Tạo mới (POST)
export const CreateUserSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  role: z.nativeEnum(UserRole).default(UserRole.ENGINEER),
  
  orgUnitId: z.number().optional().default(0),
  jobTitle: z.string().optional(),
  
  // Security Level có thể gửi lên dạng số
  securityClearance: z.coerce.number().pipe(z.nativeEnum(SecurityLevel)).default(SecurityLevel.INTERNAL),
  
  status: z.boolean().default(true),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// 3. Schema Cập nhật (PUT)
export const UpdateUserSchema = CreateUserSchema.partial().omit({ 
  password: true, // Thường update user không gửi kèm password trừ khi có API đổi pass riêng
  email: true     // Email thường là định danh, ít khi cho sửa
});

// =================================================================
// 4. EXPORT TYPES (Infer trực tiếp từ Zod)
// =================================================================
export type User = z.infer<typeof UserSchema>;
export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;