import { z } from 'zod';

// ... (Các schema search/ingest giữ nguyên) ...
export const aiSearchSchema = z.object({
  query: z.string().min(1, { message: "Vui lòng nhập câu hỏi" }),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ACCEPTED_FILE_TYPES = ["application/pdf"];
export const aiIngestSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "Vui lòng chọn file")
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), "Chỉ hỗ trợ PDF.")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File tối đa 10MB."),
});

export const aiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  createdAt: z.number(),
  isTyping: z.boolean().optional(),
  isError: z.boolean().optional(),
});

// [UPDATED] Schema khớp với dữ liệu đã qua CamelCase Transform
export const aiDocumentItemSchema = z.object({
  id: z.number(),
  promulgationYear: z.number(), // Server trả promulgation_year -> Instance đổi thành promulgationYear
  sourceFile: z.string(),       // source_file -> sourceFile
  legalLevel: z.string(),       // legal_level -> legalLevel
  totalChunks: z.number(),      // total_chunks -> totalChunks
  legalPriority: z.number(),    // legal_priority -> legalPriority
  ingestStatus: z.string(),     // ingest_status -> ingestStatus
  createdAt: z.string(),        // created_at -> createdAt
});

export const aiDocumentListResponseSchema = z.object({
  count: z.number(),
  data: z.array(aiDocumentItemSchema),
});