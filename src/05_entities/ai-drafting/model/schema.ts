import { z } from "zod";

export const GenerateDraftRequestSchema = z.object({
  // Tên dự án (Bắt buộc)
  projectName: z.string().min(1, "Thiếu tên dự án"),
  
  // Danh sách file tham chiếu (Bắt buộc)
  referenceDoc: z.array(z.string()).min(1, "Cần ít nhất 1 tài liệu tham chiếu"),
});

export type GenerateDraftFormValues = z.infer<typeof GenerateDraftRequestSchema>;