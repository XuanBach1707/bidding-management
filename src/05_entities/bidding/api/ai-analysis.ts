import { http } from "@/shared/api/instance"; 
import { BaseResponse, BidAiExtractData } from "../model/types";

// 1. Kích hoạt phân tích (POST)
export const analyzeBidAi = async (hsmtId: number): Promise<BaseResponse<string>> => {
  // Với hàm này, TS hiểu đúng vì BaseResponse bọc string
  const { data } = await http.post<BaseResponse<string>>(`/bidding-packages/${hsmtId}/analyze-ai`);
  return data;
};

// 2. Lấy kết quả phân tích (GET)
export const getBidAnalysisResult = async (hsmtId: number): Promise<BidAiExtractData> => {
  // TypeScript đang "ảo tưởng" biến response là AxiosResponse (Cái hộp)
  // Nhưng thực tế Runtime nó là BidAiExtractData (Cục thịt) do Interceptor
  const response = await http.get<BidAiExtractData>(`/packages_req/${hsmtId}/full-analysis`);
  
  // SỬA Ở ĐÂY: Dùng "as unknown as ..." để ép kiểu mạnh
  // Dịch: "Tao biết tao đang làm gì, coi nó là BidAiExtractData đi đừng thắc mắc"
  return response as unknown as BidAiExtractData; 
};