// 1. Export Types (Chỉ export type)
export type { 
    BiddingResultSummary, 
    BiddingResultFull,
    BiddingItem,
    BidderWinner,
    BidderFailed
} from "./model/types";

// 2. Export Schemas (Runtime validation object)
export { 
    BiddingResultSummarySchema, 
    BiddingResultFullSchema,
    BiddingResultItemSchema,
    BidderWinnerSchema,
    BidderFailedSchema
} from "./model/schema";

// 3. Export API
export { biddingResultApi } from "./api/bidding-result-api";