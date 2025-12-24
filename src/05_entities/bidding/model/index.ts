// 1. Export Types
export type {
  // Common
  BaseResponse,
  GetBiddingPackagesParams,
  
  // Main Entities
  BiddingPackage,
  BiddingFile,
  BiddingPackageListResponse,
  BiddingPackageDetailResponse,
  BiddingPackageFilesResponse,

  // AI Analysis Entities (MỚI)
  BidGeneralInfo,
  BidFinancialReq,
  BidPersonnelReq,
  BidEquipmentReq,
  BidAiExtractData,
  BidAiExtractResponse,
} from "./types";

// 2. Export Schemas (Zod Values)
export {
  BaseResponseSchema,
  
  // Main Schemas
  BiddingPackageSchema,
  BiddingFileSchema,

  // AI Analysis Schemas (MỚI)
  BidGeneralInfoSchema,
  BidFinancialReqSchema,
  BidPersonnelReqSchema,
  BidEquipmentReqSchema,
  BidAiExtractDataSchema,
} from "./types";