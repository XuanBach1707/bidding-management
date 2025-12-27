// entities/organization/model/schemas.ts
import { z } from "zod";
import { UnitType } from "./types";

export const organizationUnitSchema = z.object({
  unitId: z.number(),
  unitName: z.string(),
  unitCode: z.string(),
  parentUnitId: z.number().nullable().optional(), // parent_unit_id có thể là 0 hoặc null
  unitType: z.nativeEnum(UnitType).or(z.string()), // Validate theo Enum hoặc string
  description: z.string().optional(),
  managerId: z.number().optional(),
});

export const unitMemberSchema = z.object({
  userId: z.number(),
  fullName: z.string(),
  email: z.string().email().optional().or(z.literal("")), // Email có thể rỗng
  jobTitle: z.string().optional(),
  role: z.string().optional(),
});

// Type inference từ Schema (Optional - nếu bạn muốn dùng Zod để infer type)
export type OrganizationUnitSchema = z.infer<typeof organizationUnitSchema>;
export type UnitMemberSchema = z.infer<typeof unitMemberSchema>;