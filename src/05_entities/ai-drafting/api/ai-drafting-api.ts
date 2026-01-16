import { http } from "@/shared/api";
import { 
  ReferenceCollectionResponse, 
  ReferenceFilesResponse, 
  GenerateDraftRequestDto,
  GenerateContentResponse // Import type mới
} from "../model/types";

export const aiDraftingApi = {
  getCollections: async (): Promise<ReferenceCollectionResponse> => {
    return http.get("/ai-bidding/collections");
  },

  getCollectionFiles: async (collectionName: string): Promise<ReferenceFilesResponse> => {
    return http.get(`/ai-bidding/collection/${collectionName}/files`);
  },

  // Update return type
  generateContent: async (payload: GenerateDraftRequestDto): Promise<GenerateContentResponse> => {
    const formData = new URLSearchParams();
    formData.append('project_name', payload.projectName);
    if (payload.referenceDoc && Array.isArray(payload.referenceDoc)) {
        payload.referenceDoc.forEach(doc => {
            formData.append('reference_doc', doc);
        });
    }

    // Generic <T, R>: T là kiểu mong đợi, R là kiểu trả về thực tế
    const response = await http.post<GenerateContentResponse, GenerateContentResponse>(
      "/ai-bidding/agent/generate-chapter-1", 
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    return response;
  }
};