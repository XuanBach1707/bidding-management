import { z } from "zod";

// =============================================================================
// ZOD SCHEMA (VALIDATION FORM TẠO MỚI)
// =============================================================================
export const createBiddingProjectSchema = z.object({
  name: z.string().min(5, "Tên dự án phải có ít nhất 5 ký tự"),
  
  status: z.string().optional(), 
  
  // Dùng coerce.number().min(1) để ép kiểu và validate select box
  sourcePackageId: z.coerce.number()
    .min(1, "Vui lòng chọn gói thầu nguồn"), 
});

// Type cho Form (React Hook Form sẽ dùng cái này)
export type CreateBiddingProjectFormValues = z.infer<typeof createBiddingProjectSchema>;