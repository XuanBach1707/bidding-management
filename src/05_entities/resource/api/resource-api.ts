import { http } from "@/shared/api";
import { RESOURCE_REPO_ROOT_ID } from "../model/constants";
import { 
  ResourceStats, 
  ResourceFolderResponse, 
  ResourceItem,
} from "../model/types";

// ==========================================
// ĐỊNH NGHĨA TYPE (CAMELCASE DO INTERCEPTOR)
// ==========================================

// 1. Type cho Lịch sử dự án
export interface BiddingHistoryItem {
  hsmtId: number;      // Backend: hsmt_id -> Interceptor -> Frontend: hsmtId
  maTbmt: string;      // Backend: ma_tbmt -> maTbmt
  tenDuAn: string;     // Backend: ten_du_an -> tenDuAn
  chuDauTu: string;    // Backend: chu_dau_tu -> chuDauTu
  linhVuc: string;     // Backend: linh_vuc -> linhVuc
  nam: number;
}

export interface BiddingHistoryResponse {
  items: BiddingHistoryItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 2. Type cho Bộ lọc
export interface HistoryFilterOptions {
  years: number[];
  investors: string[];
}

// ==========================================
// API IMPLEMENTATION
// ==========================================

export const resourceApi = {
  /**
   * 1. Lấy thống kê cho Dashboard
   */
  getStats: async (): Promise<ResourceStats> => {
    try {
      // Interceptor trả về body response đã camelCase
      const res = await http.get("/drive/stats/count", {
        params: { folder_id: RESOURCE_REPO_ROOT_ID } // Interceptor sẽ tự convert folder_id -> folder_id (nếu cấu hình) hoặc giữ nguyên tùy snakecase-keys
      }) as any;

      return {
        totalFiles: res?.totalRepoFiles || 0,
        totalSizeLabel: "45.2 GB", 
        filesChangePercentage: 12
      };
    } catch (error) {
      console.error("Resource Stats Error:", error);
      return { totalFiles: 0 };
    }
  },

  /**
   * 2. Lấy nội dung thư mục Drive
   */
  getFolderContent: async (folderId: string = RESOURCE_REPO_ROOT_ID): Promise<ResourceFolderResponse> => {
    // Interceptor return: response.data (đã camelCase)
    return http.get(`/drive/folder/${folderId}`);
  },

  /**
   * 3. Tìm kiếm file Drive
   */
  searchResources: async (query: string, folderId?: string): Promise<ResourceItem[]> => {
    const res = await http.get("/drive/search-repo", {
      params: { 
        query, 
        folder_id: folderId 
      }
    }) as any;
    
    // API cũ của bạn có thể trả về trực tiếp mảng hoặc object chứa data
    return res.data || [];
  },

  /**
   * 4. Lấy danh sách Folder gốc
   */
  getHistoryYears: async (): Promise<ResourceItem[]> => {
    try {
      const res = await http.get("/drive/projects") as any;
      const allItems = res.data || [];
      return allItems.filter((item: any) => item.type === "FOLDER");
    } catch (error) {
      console.error("Get History Years Error:", error);
      return [];
    }
  },

  /**
   * 5. [MỚI] Lấy lịch sử năng lực dự án (Portfolio)
   * API: GET /bidding-packages/history
   */
  getBiddingHistory: async (params?: any): Promise<BiddingHistoryResponse> => {
    try {
      /* Flow dữ liệu:
         1. API trả về: { "success": true, "data": { "items": [{ "hsmt_id": ... }] } }
         2. Interceptor convert: { "success": true, "data": { "items": [{ "hsmtId": ... }] } }
         3. Hàm này nhận 'res' là object ở bước 2.
      */
      const res = await http.get("/bidding-packages/history", { params }) as any;
      
      // Lấy dữ liệu từ property .data
      return res.data || { 
        items: [], 
        total: 0, 
        page: 1, 
        size: 20, 
        pages: 0 
      }; 
    } catch (error) {
      console.error("Get Bidding History Error:", error);
      return { items: [], total: 0, page: 1, size: 20, pages: 0 };
    }
  },

  /**
   * 6. [MỚI] Lấy danh sách options cho bộ lọc
   * API: GET /bidding-packages/history/filters
   */
  getHistoryFilters: async (): Promise<HistoryFilterOptions> => {
    try {
      /*
         API trả: { "success": true, "data": { "years": [...], "investors": [...] } }
         Interceptor convert: "data" -> "data" (giữ nguyên vì deep check)
      */
      const res = await http.get("/bidding-packages/history/filters") as any;
      
      return res.data || { years: [], investors: [] };
    } catch (error) {
      console.error("Get History Filters Error:", error);
      return { years: [], investors: [] };
    }
  }
};