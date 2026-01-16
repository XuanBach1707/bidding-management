import { http } from "@/shared/api";

// 1. Định nghĩa Metadata (Các trường cấu hình ở Cột Trái)
export interface DraftMetadata {
  documentType?: string;     // Loại văn bản (Quyết định, Tờ trình...)
  issuingUnit?: string;      // Đơn vị ban hành
  signingAuthority?: string; // Thẩm quyền ký
  baseReference?: string;    // Collection RAG đã chọn (nếu cần lưu lại trạng thái này)
}

// 2. Payload gửi lên khi Save (Gộp Content + Metadata)
export interface SaveDraftPayload {
  content: string;           // Nội dung HTML từ Editor
  metadata: DraftMetadata;   // Thông tin cấu hình
}

// 3. Response trả về khi Load
export interface DraftResponse {
  draftContent: string;
  metadata?: DraftMetadata; // Có thể undefined nếu là bản nháp cũ chưa có meta
}

export const draftingApi = {
  // Save Draft: Nhận vào payload phức hợp thay vì string đơn lẻ
  saveDraft: async (taskId: number, payload: SaveDraftPayload) => {
    // Lưu ý: Interceptor sẽ tự động lo việc chuyển camelCase -> snake_case
    // VD: issuingUnit -> issuing_unit
    return http.post(`/drafting/task/${taskId}/save`, payload);
  },

  // Load Draft: Trả về trọn gói object thay vì chỉ trả string content
  loadDraft: async (taskId: number): Promise<DraftResponse> => {
    const res = await http.get<DraftResponse, DraftResponse>(
      `/drafting/task/${taskId}/load`
    );
    
    // Trả về nguyên object để Component tự destructure:
    // - content -> nạp vào Editor
    // - metadata -> nạp vào Form Config
    return res;
  }
};