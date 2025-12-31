// src/entities/user/model/types.ts
import { z } from "zod";
import { 
  UserSchema, 
  CreateUserSchema, 
  UpdateUserSchema 
} from "./schemas";

// 1. Export các Enum từ consts (để dùng làm Type luôn)
export { UserRole, SecurityLevel } from "./consts";

// 2. Infer Type từ Schema (Tự động khớp 100% với validate)
// Type User lúc này sẽ tự động có: userId, fullName, email, role, status, securityClearance...
export type User = z.infer<typeof UserSchema>;

export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;