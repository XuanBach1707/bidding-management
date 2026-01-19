import { z } from 'zod';
import { 
  aiSearchSchema, 
  aiIngestSchema, 
  aiMessageSchema, 
  aiDocumentItemSchema, 
  aiDocumentListResponseSchema,
  aiCollectionResponseSchema // [NEW]
} from './schemas';

export type AiSearchParams = z.infer<typeof aiSearchSchema>;
export type AiIngestParams = z.infer<typeof aiIngestSchema>;
export type AiMessage = z.infer<typeof aiMessageSchema>;
export type AiDocumentItem = z.infer<typeof aiDocumentItemSchema>;
export type AiDocumentListResponse = z.infer<typeof aiDocumentListResponseSchema>;
export type AiCollectionResponse = z.infer<typeof aiCollectionResponseSchema>; // [NEW]