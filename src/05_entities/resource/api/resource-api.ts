import { http } from "@/shared/api";
import { RESOURCE_REPO_ROOT_ID } from "../model/constants";
import { 
  ResourceStats, 
  ResourceFolderResponse, 
  YearFolder, 
  ResourceItem,
  ApiStatsResponse
} from "../model/types";

export const resourceApi = {
  /**
   * 1. Lấy thống kê cho Dashboard
   */
  getStats: async (): Promise<ResourceStats> => {
    try {
      // Ép kiểu 'as unknown as ApiStatsResponse' để báo cho TS biết
      // Interceptor đã trả về data object chứ không phải AxiosResponse
      const response = await http.get("/drive/stats/count", {
        params: { folder_id: RESOURCE_REPO_ROOT_ID }
      }) as unknown as ApiStatsResponse;

      // [FIX LỖI]: Dùng key camelCase (do Interceptor đã convert)
      return {
        totalFiles: response?.totalRepoFiles || 0,
        
        // Mock data
        totalSizeLabel: "45.2 GB", 
        filesChangePercentage: 12
      };
    } catch (error) {
      console.error("Resource Stats Error:", error);
      return { totalFiles: 0 };
    }
  },

  /**
   * 2. Lấy nội dung thư mục
   */
  getFolderContent: async (folderId: string = RESOURCE_REPO_ROOT_ID): Promise<ResourceFolderResponse> => {
    // Interceptor đã trả về data luôn, nên ta ép kiểu trực tiếp sang ResourceFolderResponse
    const res = await http.get(`/drive/folder/${folderId}`) as unknown as ResourceFolderResponse;
    return res;
  },

  /**
   * 3. Tìm kiếm file
   */
  searchResources: async (query: string, folderId?: string): Promise<ResourceItem[]> => {
    // Search response cũng sẽ được camelCase
    const res = await http.get("/drive/search-repo", {
      params: { 
        query, 
        folder_id: folderId 
      }
    }) as unknown as { data: ResourceItem[] };
    
    return res.data || [];
  },

  /**
   * 4. Lấy danh sách Năm
   */
  getHistoryYears: async (): Promise<YearFolder[]> => {
    try {
      // Ép kiểu response về dạng object có chứa mảng data
      const res = await http.get("/drive/projects") as unknown as { data: any[] };
      const allItems = res.data || [];

      const years: YearFolder[] = allItems
        .filter((item) => 
          item.type === "FOLDER" && 
          /^\d{4}$/.test(item.name)
        )
        .map((item) => ({
          id: item.id,
          year: parseInt(item.name, 10)
        }))
        .sort((a, b) => b.year - a.year);

      return years;
    } catch (error) {
      console.error("Get History Years Error:", error);
      return [];
    }
  }
};