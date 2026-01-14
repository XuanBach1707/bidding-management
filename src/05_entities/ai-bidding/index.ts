// Export API
export { aiBiddingApi } from './api/ai-bidding.api';

// Export Types
export type { 
  AiSearchParams, 
  AiIngestParams, 
  AiMessage,
  AiDocumentItem,          // [NEW]
  AiDocumentListResponse   // [NEW]
} from './model/types';

// Export Schemas
export { 
  aiSearchSchema, 
  aiIngestSchema, 
  aiMessageSchema,
  aiDocumentItemSchema,         // [NEW]
  aiDocumentListResponseSchema  // [NEW]
} from './model/schemas';