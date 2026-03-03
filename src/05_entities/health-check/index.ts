// 1. Export Data Types (Định nghĩa kiểu dữ liệu)
// Dùng 'export type' để compiler tự động loại bỏ (erase) sau khi compile sang JavaScript
export type {
  HealthCheckDetail,
  HealthCheckCategory,
  HealthCheckResponse,
} from "./model/types";

// 2. Export API Services (Dịch vụ mạng)
export { 
  getHealthCheck 
} from "./api/api";