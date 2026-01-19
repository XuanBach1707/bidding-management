// Export API
export { aiBiddingApi } from './api/ai-bidding.api';

// Export Types
export type { 
  AiSearchParams, 
  AiIngestParams, 
  AiMessage,
  AiDocumentItem,
  AiDocumentListResponse,
  AiCollectionResponse // [NEW]
} from './model/types';

// Export Schemas
export { 
  aiSearchSchema, 
  aiIngestSchema,
  LEGAL_LEVELS,        // [NEW] Export hằng số để UI dùng làm options cho Select/Dropdown
  aiMessageSchema,
  aiDocumentItemSchema,
  aiDocumentListResponseSchema,
  aiCollectionResponseSchema // [NEW]
} from './model/schemas';