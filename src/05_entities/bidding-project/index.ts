// 1. API Service
export { biddingProjectApi } from "./api/bidding-project-api";

// 2. Types & Interfaces
export type { 
    BiddingProject, 
    CreateBiddingProjectDto, 
    BiddingPackage,
    // [QUAN TRỌNG] Thêm type này để widget hiển thị danh sách nhân sự
    ProjectPersonnel 
} from "./model/types";

// 3. Zod Schemas
export { 
    createBiddingProjectSchema 
} from "./model/schemas"; // (Lưu ý: kiểm tra tên file thực tế là schema.ts hay schemas.ts)

// Export thêm Schema nhân sự (nếu cần validate ở nơi khác)
// Lưu ý: ProjectPersonnelSchema lúc nãy ta định nghĩa bên file types.ts
export { ProjectPersonnelSchema } from "./model/types";