import { z } from "zod";

// --- 1. SCHEMAS CHO SUMMARY (List View) ---
// Note: Key đã được Axios chuyển sang camelCase
export const BiddingResultSummarySchema = z.object({
  hsmtId: z.number().optional(),
  biddingResultText: z.string().nullable().optional(),
  approvalDate: z.string().nullable().optional(), 
  winnerName: z.string().nullable().optional(),
  winningPrice: z.string().nullable().optional(), 
});

// --- 2. SCHEMAS CHO FULL DETAIL (Detail View) ---

// A. Hàng hóa (Items)
export const BiddingResultItemSchema = z.object({
  id: z.number(),
  resultId: z.number().optional(), 
  
  itemName: z.string().nullable().optional(),          
  model: z.string().nullable().optional(),             
  brand: z.string().nullable().optional(),              
  manufacturer: z.string().nullable().optional(),      
  origin: z.string().nullable().optional(),             
  yearOfManufacture: z.string().nullable().optional(),
  technicalSpecs: z.string().nullable().optional(),    
});

// B. Nhà thầu trúng (Winners)
export const BidderWinnerSchema = z.object({
  id: z.number(),
  bidderCode: z.string().nullable().optional(),
  bidderName: z.string().nullable().optional(),
  taxCode: z.string().nullable().optional(),
  
  role: z.string().nullable().optional(),             
  winningPrice: z.string().nullable().optional(),    
  evaluatedPrice: z.string().nullable().optional(),  
  contractPeriod: z.string().nullable().optional(),  
  
  technicalScore: z.string().nullable().optional(),  
  otherContent: z.string().nullable().optional(),
});

// C. Nhà thầu trượt (Failed)
export const BidderFailedSchema = z.object({
  id: z.number(),
  bidderCode: z.string().nullable().optional(),
  bidderName: z.string().nullable().optional(),
  taxCode: z.string().nullable().optional(),
  
  jointVentureName: z.string().nullable().optional(),
  reason: z.string().nullable().optional(), 
});

// D. Schema Tổng (Root)
export const BiddingResultFullSchema = z.object({
  id: z.number(),
  hsmtId: z.number().optional(),
  
  // Trạng thái chung
  resultStatus: z.string().nullable().optional(),
  biddingResultText: z.string().nullable().optional(),
  
  // Thông tin quyết định
  decisionNumber: z.string().nullable().optional(),
  approvingAgency: z.string().nullable().optional(),
  approvalDate: z.string().nullable().optional(),
  postingDate: z.string().nullable().optional(),
  
  packagePrice: z.string().nullable().optional(),
  
  createdAt: z.string().nullable().optional(),
  
  // Các danh sách con
  winners: z.array(BidderWinnerSchema).default([]).optional(),
  failedBidders: z.array(BidderFailedSchema).default([]).optional(),
  items: z.array(BiddingResultItemSchema).default([]).optional(),
});