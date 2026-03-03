    // Import http instance của bạn (điều chỉnh lại đường dẫn import cho đúng với project thực tế)
import { http } from "@/shared/api/"; 
import { HealthCheckResponseSchema } from "../model/schemas";
import type { HealthCheckResponse } from "../model/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

export const getHealthCheck = async (hsmtId: number | string): Promise<ApiResponse<HealthCheckResponse>> => {
  try {
    // Interceptor sẽ lo việc đính kèm baseURL (/api-proxy)
    // Proxy sẽ lo việc cắt trailing slash và đẩy về backend
    const response = await http.get(`/packages_req/${hsmtId}/health-check`);

    // Dữ liệu lúc này ĐÃ ĐƯỢC camelCase bởi Response Interceptor
    // Tiến hành Runtime Validation qua Zod
    const validatedData = HealthCheckResponseSchema.parse(response);

    return { 
      success: true, 
      data: validatedData 
    };
  } catch (error) {
    console.error("[HealthCheck API] Lỗi truy xuất dữ liệu:", error);
    return { 
      success: false, 
      error 
    };
  }
};