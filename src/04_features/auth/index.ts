// src/features/auth/index.ts

// 1. Export UI Components
export { LoginForm } from "./ui/login-form";

// 2. Export API & Types (Explicit Named Exports)
export { 
  authApi,
  // Schemas
  LoginRequestSchema,
  LoginResponseSchema,
  // Types
  type LoginRequest,
  type LoginResponse 
} from "./api/auth.api";

// 3. Export Context & Hooks (Nếu bạn muốn module khác dùng được useAuth từ đây luôn)
export { 
  AuthProvider, 
  useAuth 
} from "./model/auth-context";

// 4. Export Dialog Đổi mật khẩu (Vì nó thuộc feature auth)
export { ChangePasswordDialog } from "./ui/change-password-dialog";