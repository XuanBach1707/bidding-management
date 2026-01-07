import { z } from "zod";

// =============================================================================
// 1. ZOD SCHEMA (VALIDATION)
// =============================================================================
export const createBiddingProjectSchema = z.object({
  name: z.string().min(5, "Tên dự án phải có ít nhất 5 ký tự"),
  
  status: z.string().optional(), 
  
  // [SỬA LỖI] Thay vì truyền config vào trong, ta dùng chain method .min()
  // Lý do: coerce.number() sẽ biến chuỗi rỗng "" thành 0. 
  // .min(1) sẽ chặn được cả trường hợp chưa chọn (0) và trường hợp chọn sai.
  sourcePackageId: z.coerce.number()
    .min(1, "Vui lòng chọn gói thầu nguồn"), 
});

// Type cho Form (React Hook Form sẽ dùng cái này)
export type CreateBiddingProjectFormValues = z.infer<typeof createBiddingProjectSchema>;