import { z } from "zod";
import { GenerateDraftRequestSchema } from "./schema";

export type GenerateDraftRequestDto = z.infer<typeof GenerateDraftRequestSchema>;

export interface ReferenceCollectionResponse {
  activeInChroma: string[]; 
  usedInSql: string[];
  countChroma: number;
  countSql: number;
}

export interface ReferenceFilesResponse {
  collection: string;
  totalFiles: number;
  files: string[]; 
}

// [MỚI] Type khớp với Response thật của API
export interface GenerateContentResponse {
  status: string;        // "success"
  project: string;       // "Sửa chữa lưới điện..."
  used_template: string; // "Bien phap thi cong T3.pdf"
  data: string;          // Chuỗi Markdown "```markdown\n# CHƯƠNG I..."
}