// Export Instance (Đường ống)
export { http } from "./instance";

// Export Schema & Model Types (Luật lệ & Dữ liệu)
export { 
  UserSchema, 
  TokenSchema 
} from "./schema";

export type { 
  User, 
  Token 
} from "./schema";

// Export Response Types (Vỏ bọc)
export type { 
  ApiResponse, 
  ApiError 
} from "./types";

// Export Utils (Hàm hỗ trợ)
export { validateResponse } from "./utils";