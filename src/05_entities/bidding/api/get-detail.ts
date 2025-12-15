// src/entities/bidding/api/get-detail.ts
import { http } from "@/shared/api/"; // Đường dẫn tới file interceptor bạn gửi
import type { 
  BiddingPackage, 
  BiddingPackageDetailResponse 
} from "../model/types";

// Hàm trả về 1 Object BiddingPackage duy nhất (đã bóc từ mảng ra)
export const getBiddingPackageDetail = async (
  hsmtId: number | string
): Promise<{ success: boolean; data: BiddingPackage | null }> => {
  try {
    const res = await http.get<any, BiddingPackageDetailResponse>(`/bidding-packages/${hsmtId}`);
    
    // Xử lý logic bóc tách mảng tại đây
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return { success: true, data: res.data[0] };
    }

    return { success: false, data: null };
  } catch (error) {
    console.error("Error fetching detail:", error);
    return { success: false, data: null }; // Hoặc throw error tùy cách bạn handle
  }
};