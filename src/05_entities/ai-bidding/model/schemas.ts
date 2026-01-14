import { z } from 'zod';

// --- 1. SEARCH SCHEMA (Giữ nguyên) ---
export const aiSearchSchema = z.object({
  query: z.string().min(1, { message: "Vui lòng nhập câu hỏi" }),
});

// --- 2. INGEST SCHEMA (Đã sửa lỗi) ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ACCEPTED_FILE_TYPES = ["application/pdf"];

// Các giá trị cố định
export const LEGAL_LEVELS = ['law', 'decree', 'circular'] as const;

export const aiIngestSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "Vui lòng chọn file")
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), "Chỉ hỗ trợ PDF.")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File tối đa 10MB."),
  
  // [FIXED] Dùng string().refine thay vì z.enum để tránh lỗi Type overload
  legalLevel: z.string()
    .refine((val) => (LEGAL_LEVELS as readonly string[]).includes(val), {
      message: "Vui lòng chọn cấp độ pháp lý (Luật, Nghị định, Thông tư)"
    }),

  // [FIXED] Dùng z.coerce.number() chuẩn cú pháp Zod
  promulgationYear: z.coerce.number()
    .min(1900, "Năm không hợp lệ")
    .max(new Date().getFullYear() + 1, "Năm không được lớn hơn năm sau"),

  // [NEW] Tên collection
  collectionName: z.string().min(1, "Vui lòng chọn hoặc nhập tên Collection"),
});

// --- 3. MESSAGE SCHEMA (Giữ nguyên) ---
export const aiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  createdAt: z.number(),
  isTyping: z.boolean().optional(),
  isError: z.boolean().optional(),
});

// --- 4. DOCUMENT ITEM SCHEMA (Giữ nguyên) ---
export const aiDocumentItemSchema = z.object({
  id: z.number(),
  promulgationYear: z.number(), 
  sourceFile: z.string(),       
  legalLevel: z.string(),       
  totalChunks: z.number(),      
  legalPriority: z.number(),    
  ingestStatus: z.string(),     
  createdAt: z.string(),   
  collectionName: z.string().optional(),     
});

export const aiDocumentListResponseSchema = z.object({
  count: z.number(),
  data: z.array(aiDocumentItemSchema),
});

// --- 5. COLLECTION SCHEMA (Giữ nguyên) ---
export const aiCollectionResponseSchema = z.object({
  activeInChroma: z.array(z.string()),
  usedInSql: z.array(z.string()),
  countChroma: z.number(),
  countSql: z.number(),
});