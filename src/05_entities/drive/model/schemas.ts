import { z } from "zod";

export const driveItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["FOLDER", "FILE"]).or(z.string()),
  link: z.string().url(),
  access: z.string(),
  mimeType: z.string().optional(),
  level: z.number().optional(),
  
  // [MỚI] Thêm các trường từ API mới
  tag: z.string().optional(), 
  grantedByProject: z.string().optional(),
});

export const driveResponseSchema = z.object({
  currentContext: z.string().optional(),
  currentFolderId: z.string().optional(),
  total: z.number().optional(),
  totalItems: z.number().optional(),
  data: z.array(driveItemSchema),
});

// [MỚI] Schema cho hành động Clone File
export const cloneFileSchema = z.object({
  sourceFileId: z.string(),
  targetFolderId: z.string(),
});

export type DriveItemSchema = z.infer<typeof driveItemSchema>;