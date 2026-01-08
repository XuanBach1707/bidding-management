// src/entities/user/model/types.ts
import { z } from "zod";
import { 
  UserSchema, 
  CreateUserSchema, 
  UpdateUserSchema,
  ChangePasswordSchema, // [MỚI]
  ResetPasswordSchema   // [MỚI]
} from "./schemas";

// 1. Export Enum
export { UserRole, SecurityLevel } from "./consts";

// 2. Export Type User & Form
export type User = z.infer<typeof UserSchema>;
export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;

// 3. [MỚI] Export Type cho tính năng Password
export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;