// 1. Export Types (Dùng 'export type' để tối ưu bundle size)
export type { 
    ResourceItem,
    ResourceFolderResponse,
    ResourceStats,
    ApiStatsResponse,
    // Các type mới cho Lịch sử thầu
    BiddingHistoryItem,
    BiddingHistoryResponse,
    HistoryFilterOptions
} from "./model/types";

// 2. Export Zod Schemas
export { 
    resourceItemSchema,
    resourceFolderResponseSchema,
    resourceStatsSchema,
    // Các schema mới cho Lịch sử thầu
    biddingHistoryItemSchema,
    biddingHistoryResponseSchema,
    historyFilterOptionsSchema
} from "./model/schema";

// 3. Export Constants
export { 
    RESOURCE_REPO_ROOT_ID 
} from "./model/constants";

// 4. Export API Instance
export { 
    resourceApi 
} from "./api/resource-api";