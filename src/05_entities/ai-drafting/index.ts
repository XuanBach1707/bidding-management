// 1. API Service
export { aiDraftingApi } from "./api/ai-drafting-api";

// 2. Schemas (Zod Validation)
export { GenerateDraftRequestSchema } from "./model/schema";
export type { GenerateDraftFormValues } from "./model/schema";

// 3. Types (Interfaces & DTOs)
export type { 
    GenerateDraftRequestDto,
    ReferenceCollectionResponse,
    ReferenceFilesResponse
} from "./model/types";