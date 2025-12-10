import { z } from "zod";

/**
 * Hàm này dùng để kiểm tra dữ liệu API trả về có khớp với Schema không.
 * Nếu API trả về sai (ví dụ thiếu trường id), nó sẽ báo lỗi ngay lập tức
 * thay vì để app chạy sai ngầm định.
 */
export function validateResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    console.error("API Response Validation Error:", result.error.format());
    // Tùy chọn: Có thể throw lỗi hoặc trả về data mặc định
    throw new Error("Dữ liệu từ Server không đúng định dạng!");
  }
  
  return result.data;
}