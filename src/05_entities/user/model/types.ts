import { z } from "zod";
import { UserSchema, UserRoleEnum } from "./schemas";

export type UserRole = z.infer<typeof UserRoleEnum>;

export interface User {
  id: number;
  username?: string;
  fullName: string;
  email?: string | null;
  avatarUrl?: string | null;
  
  role?: UserRole;
  unitId?: number | null;
  unitName?: string | null;
  
  isActive: boolean;
}