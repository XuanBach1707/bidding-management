// 1. Export Models & Types
export {
  // Types
  type BiddingPackage,
  type BiddingFile,
  type GetBiddingPackagesParams,
  type BaseResponse,
  
  // AI Types (Để Feature dùng)
  type BidAiExtractData,
  type BidGeneralInfo,
  type BidFinancialReq,
  type BidPersonnelReq,
  type BidEquipmentReq,

  // Schemas (Nếu cần validate lại ở form)
  BiddingPackageSchema,
  BidAiExtractDataSchema,
} from "./model";

// 2. Export APIs
export {
  getBiddingPackages,
  getBiddingPackageDetail,
  getBiddingPackageFiles,
  updateBiddingDecision,
  analyzeBidAi, // API mới
  getBidAnalysisResult, // API mới
} from "./api";

// 3. Export UI Components
export { BiddingCard } from "./ui/bidding-card";
export { BiddingCardSkeleton } from "./ui/bidding-card-skeleton";
export { useBiddingList } from "./api/use-bidding-list";