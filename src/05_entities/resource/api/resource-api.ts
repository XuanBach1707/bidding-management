import { http } from "@/shared/api";
import { RESOURCE_REPO_ROOT_ID } from "../model/constants";
import { 
  ResourceStats, 
  ResourceFolderResponse, 
  ResourceItem,
  HistoryFilterOptions,
  BiddingHistoryResponse
} from "../model/types";

// ==========================================
// API IMPLEMENTATION
// ==========================================

export const resourceApi = {
  /**
   * 1. Lấy thống kê cho Dashboard
   */
  getStats: async (): Promise<ResourceStats> => {
    try {
      // Interceptor trả về body response đã camelCase:
      // { totalRepoFiles: 34, breakdown: [...], ... }
      const res = await http.get("/drive/stats/count", {
        params: { folder_id: RESOURCE_REPO_ROOT_ID } 
      }) as any;

      return {
        // Map totalRepoFiles -> totalFiles
        totalFiles: res?.totalRepoFiles || 0,
        
        // [QUAN TRỌNG] Map mảng breakdown để vẽ biểu đồ
        breakdown: res?.breakdown || [],

        // Các số liệu giả lập (Giữ lại vì API chưa trả về)
        totalSizeLabel: "45.2 GB", 
        filesChangePercentage: 12
      };
    } catch (error) {
      console.error("Resource Stats Error:", error);
      // Trả về object rỗng an toàn để không crash UI
      return { totalFiles: 0, breakdown: [] };
    }
  },

  /**
   * 2. Lấy nội dung thư mục Drive
   */
  getFolderContent: async (folderId: string = RESOURCE_REPO_ROOT_ID): Promise<ResourceFolderResponse> => {
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
    
    return res.data || [];
  },

  /**
   * 4. Lấy danh sách Folder gốc (History Years)
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
   * 5. Lấy lịch sử năng lực dự án (Portfolio)
   */
  getBiddingHistory: async (params?: any): Promise<BiddingHistoryResponse> => {
    try {
      const res = await http.get("/bidding-packages/history", { params }) as any;
      
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
   * 6. Lấy danh sách options cho bộ lọc
   */
  getHistoryFilters: async (): Promise<HistoryFilterOptions> => {
    try {
      const res = await http.get("/bidding-packages/history/filters") as any;
      return res.data || { years: [], investors: [] };
    } catch (error) {
      console.error("Get History Filters Error:", error);
      return { years: [], investors: [] };
    }
  }
};