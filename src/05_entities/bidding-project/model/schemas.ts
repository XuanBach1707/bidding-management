import { z } from "zod";

export const createBiddingProjectSchema = z.object({
  name: z.string().min(5, "Tên dự án phải có ít nhất 5 ký tự"),
  // Đổi default thành optional để tránh lỗi lệch pha undefined/string
  status: z.string().optional(), 
  sourcePackageId: z.number(),
});