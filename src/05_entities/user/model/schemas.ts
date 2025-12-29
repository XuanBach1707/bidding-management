import { z } from "zod";

export const UserRoleEnum = z.enum([
  "ADMIN", 
  "MANAGER", 
  "BID_MANAGER", 
  "SPECIALIST", 
  "ENGINEER", 
  "JKAN"
]);

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  fullName: z.string(),
  email: z.string().email().optional().nullable(),
  avatarUrl: z.string().nullable().optional(),
  
  // Role & Unit
  role: UserRoleEnum.optional(),
  unitId: z.number().nullable().optional(),
  unitName: z.string().nullable().optional(),
  
  isActive: z.boolean().default(true),
});

export type UserSchemaType = z.infer<typeof UserSchema>;