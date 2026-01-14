import { http } from '@/shared/api/instance';
import { 
  AiSearchParams, 
  AiIngestParams, 
  AiDocumentListResponse 
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
   * Upload file PDF để RAG (Async Ingest)
   * Endpoint: POST /ai-bidding/ingest-async
   */
  ingestFile: ({ file }: AiIngestParams) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return http.post<string>('/ai-bidding/ingest-async', formData) as unknown as Promise<string>;
  },

  /**
   * Lấy danh sách tài liệu đã được Ingest vào hệ thống
   * Endpoint: GET /ai-bidding/documents
   * Ép kiểu trực tiếp về Promise của Response Data vì Interceptor đã bóc vỏ AxiosResponse
   */
  getDocuments: () => {
    return http.get<AiDocumentListResponse>('/ai-bidding/documents') as unknown as Promise<AiDocumentListResponse>;
  }
};