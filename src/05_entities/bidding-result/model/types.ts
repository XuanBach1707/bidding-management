import { z } from "zod";
import { 
  BiddingResultSummarySchema, 
  BiddingResultFullSchema,
  BiddingResultItemSchema,
  BidderWinnerSchema,
  BidderFailedSchema
} from "./schema";

export type BiddingResultSummary = z.infer<typeof BiddingResultSummarySchema>;
export type BiddingResultFull = z.infer<typeof BiddingResultFullSchema>;
export type BiddingItem = z.infer<typeof BiddingResultItemSchema>;
export type BidderWinner = z.infer<typeof BidderWinnerSchema>;
export type BidderFailed = z.infer<typeof BidderFailedSchema>;