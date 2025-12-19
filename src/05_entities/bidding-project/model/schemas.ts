import { z } from "zod";

export const createBiddingProjectSchema = z.object({
  name: z.string().min(5, "Tên dự án phải có ít nhất 5 ký tự"),
  
  // Status để optional
  status: z.string().optional(), 
  
  // SỬA LỖI: Dùng { message: "..." } thay vì required_error để tương thích
  sourcePackageId: z.number({ 
    message: "Vui lòng chọn gói thầu nguồn" 
  }),
});

// Export type cho Form luôn để tiện dùng trong component
export type CreateBiddingProjectFormValues = z.infer<typeof createBiddingProjectSchema>;