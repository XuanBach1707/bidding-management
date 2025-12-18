import { http } from "@/shared/api/";

/**
 * Gửi quyết định GO/NO_GO cho một gói thầu
 * Interceptor sẽ tự chuyển 'hsmtId' và data sang snake_case nếu cần
 */
export const updateBiddingDecision = async (
  hsmtId: number | string, 
  decision: "GO" | "NO_GO", 
  reason: string
) => {
  // Kết quả trả về sẽ tự động được camelcaseKeys
  return http.put<any, any>(`/bidding-packages/${hsmtId}/decision`, {
    decision,
    reason
  });
};