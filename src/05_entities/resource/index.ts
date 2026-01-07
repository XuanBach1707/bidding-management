// 1. Export Types (Dùng 'export type' để tối ưu bundle size)
export type { 
    ResourceItem,
    ResourceFolderResponse,
    ResourceStats,
    ApiStatsResponse,
    // [MỚI] Type cho item biểu đồ
    ResourceBreakdownItem,
    // Các type cho Lịch sử thầu
    BiddingHistoryItem,
    BiddingHistoryResponse,
    HistoryFilterOptions
} from "./model/types";

// 2. Export Zod Schemas
export { 
    resourceItemSchema,
    resourceFolderResponseSchema,
    resourceStatsSchema,
    // [MỚI] Schema cho item biểu đồ
    resourceBreakdownItemSchema,
    // Các schema cho Lịch sử thầu
    biddingHistoryItemSchema,
    biddingHistoryResponseSchema,
    historyFilterOptionsSchema
} from "./model/schema";

// 3. Export Constants
export { 
    RESOURCE_REPO_ROOT_ID 
} from "./model/constants";

// 4. Export API Instance
// [LƯU Ý] Kiểm tra lại tên file thực tế của bạn là 'resource-api' hay 'resource' 
// (trong đoạn code trước tôi thấy bạn dùng tên file là resource.ts, nhưng ở đây bạn import resource-api)
export { 
    resourceApi 
} from "./api/resource-api";