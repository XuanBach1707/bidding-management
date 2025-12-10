// File: 05_entities/project/model/model.ts
import { z } from 'zod';

export const ProjectStatusSchema = z.enum([
  'PLANNING', 
  'IN_PROGRESS', 
  'WAITING_APPROVAL', // Chờ phê duyệt giá/chủ trương
  'SUBMITTED',
  'WON', 
  'LOST'
]);

export const BiddingProjectSchema = z.object({
  projectId: z.number().int().positive(),         // project_id
  hsmtId: z.number().int().positive(),            // hsmt_id (Liên kết tới BiddingPackage)
  bidManagerId: z.number().int().positive(),      // bid_manager_id (Người Chủ trì)
  status: ProjectStatusSchema,
  submissionDate: z.string().datetime().nullable().optional(), // submission_date (Ngày nộp thực tế)
  
  // Các trường JOIN từ bảng khác (BE cần JOIN để trả về)
  packageName: z.string().optional(),             // Tên gói thầu (Từ BiddingPackage)
  bidManagerName: z.string().optional(),          // Tên Chủ trì (Từ User)
  closingDate: z.string().datetime().optional(),  // Hạn đóng thầu (Từ BiddingPackage)
});

export type BiddingProject = z.infer<typeof BiddingProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;