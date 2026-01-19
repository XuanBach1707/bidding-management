import { http } from '@/shared/api/instance';
import { 
  AiSearchParams, 
  AiIngestParams, 
  AiDocumentListResponse,
  AiCollectionResponse 
} from '../model/types';

export const aiBiddingApi = {
  /**
   * Gửi câu hỏi cho AI (Bidding Chat)
   * Endpoint: POST /ai-bidding/search?query=...
   */
  search: (params: AiSearchParams) => {
    return http.post<string>('/ai-bidding/search', null, {
      params: { query: params.query } 
    }) as unknown as Promise<string>;
  },

  /**
   * Lấy danh sách Collections (để điền vào dropdown khi upload)
   * Endpoint: GET /ai-bidding/collections
   */
  getCollections: () => {
    return http.get<AiCollectionResponse>('/ai-bidding/collections') as unknown as Promise<AiCollectionResponse>;
  },

  /**
   * Upload file PDF để RAG (Async Ingest)
   * Endpoint: POST /ai-bidding/ingest-async
   * Note: Vì dùng FormData, Interceptor không tự chuyển snake_case, ta phải tự làm.
   */
  ingestFile: ({ file, legalLevel, promulgationYear, collectionName }: AiIngestParams) => {
    const formData = new FormData();
    
    // 1. Binary File
    formData.append('file', file);
    
    // 2. Metadata (Manual Snake Case mapping)
    formData.append('legal_level', legalLevel);
    formData.append('promulgation_year', promulgationYear.toString());
    formData.append('collection_name', collectionName);
    
    return http.post<string>('/ai-bidding/ingest-async', formData) as unknown as Promise<string>;
  },

  /**
   * Lấy danh sách tài liệu đã được Ingest vào hệ thống
   * Endpoint: GET /ai-bidding/documents
   */
  getDocuments: () => {
    return http.get<AiDocumentListResponse>('/ai-bidding/documents') as unknown as Promise<AiDocumentListResponse>;
  },

  /**
   * Xóa tài liệu khỏi hệ thống
   * Endpoint: DELETE /ai-bidding/documents/{filename}
   */
  deleteDocument: (filename: string) => {
    // Cần encodeURIComponent để xử lý tên file có ký tự đặc biệt hoặc dấu cách
    return http.delete<void>(`/ai-bidding/documents/${encodeURIComponent(filename)}`) as unknown as Promise<void>;
  }
};