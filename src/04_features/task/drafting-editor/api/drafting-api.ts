import { http } from "@/shared/api";

// Định nghĩa nhanh kiểu trả về của API Load Draft
// (Không dùng TemplateSchema vì API này trả về cấu trúc khác)
interface DraftResponse {
  draftContent: string;
}

export const draftingApi = {
  // Save Draft
  saveDraft: async (taskId: number, content: string) => {
    return http.post(`/drafting/task/${taskId}/save`, { content });
  },

  // Load Draft
  loadDraft: async (taskId: number) => {
    // CÁCH SỬA LỖI TYPESCRIPT:
    // http.get<T, R>
    // - T: Kiểu dữ liệu mong muốn trong data.
    // - R: Kiểu dữ liệu thực tế trả về sau khi qua Interceptor (chính là T luôn).
    
    const res = await http.get<DraftResponse, DraftResponse>(
      `/drafting/task/${taskId}/load`
    );
    
    // Bây giờ TS đã hiểu res chính là DraftResponse
    return res.draftContent;
  }
};