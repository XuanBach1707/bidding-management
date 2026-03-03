// src/entities/bidding/index.ts

// 1. Export Models & Types
export {
  type BiddingPackage,
  type BiddingFile,
  type GetBiddingPackagesParams,
  type BidAiExtractData,
  type BidGeneralInfo,
  type BidFinancialReq,
  type BidPersonnelReq,
  type BidEquipmentReq,
  BiddingPackageSchema,
  BidAiExtractDataSchema,
} from "./model";

// 2. Export APIs (Gom tất cả vào 1 block)
export {
  getBiddingPackages,
  getBiddingPackageDetail,
  getBiddingPackageFiles,
  updateBiddingDecision,
  analyzeBidAi, 
  getBidAnalysisResult,
  getPendingReviewPackages, // [NEW] Danh sách chờ duyệt
  submitBiddingReview       // [NEW] Trình duyệt
} from "./api";

// 3. Export UI Components
export { BiddingCard } from "./ui/bidding-card";
export { BiddingCardSkeleton } from "./ui/bidding-card-skeleton";
export { useBiddingList } from "./api/use-bidding-list";