import { http } from "@/shared/api/";

/**
 * Gửi quyết định GO/NO_GO cho một gói thầu
 */
export const updateBiddingDecision = async (
  hsmtId: number | string, 
  decision: "GO" | "NO_GO", 
  reason: string
) => {
  return http.put<any, any>(`/bidding-packages/${hsmtId}/decision`, {
    decision,
    reason
  });
};

/**
 * Trình lãnh đạo phê duyệt gói thầu
 */
export const submitBiddingReview = async (
  hsmtId: number | string
) => {
  return http.put<any, any>(`/bidding-packages/${hsmtId}/submit-review`);
};