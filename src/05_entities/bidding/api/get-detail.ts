// src/entities/bidding/api/get-detail.ts
import { http } from "@/shared/api/"; 
import type { 
  BiddingPackage, 
  BiddingPackageDetailResponse 
} from "../model/types";

export const getBiddingPackageDetail = async (
  hsmtId: number | string
): Promise<{ success: boolean; data: BiddingPackage | null }> => {
  try {
    // Interceptor đã convert key sang camelCase rồi
    const res = await http.get<any, BiddingPackageDetailResponse>(`/bidding-packages/${hsmtId}`);
    
    // 1. Kiểm tra nếu success ok
    if (res.success && res.data) {
        
        // TRƯỜNG HỢP 1 (Chuẩn): API trả về Object
        if (!Array.isArray(res.data)) {
            return { success: true, data: res.data };
        }

        // TRƯỜNG HỢP 2 (Fallback): API trả về Mảng
        if (Array.isArray(res.data) && res.data.length > 0) {
            return { success: true, data: res.data[0] };
        }
    }

    return { success: false, data: null };
  } catch (error) {
    console.error("Error fetching detail:", error);
    return { success: false, data: null }; 
  }
};