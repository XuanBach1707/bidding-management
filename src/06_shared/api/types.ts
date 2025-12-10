// Định nghĩa cái "Vỏ bọc" chung mà Backend luôn trả về
export interface ApiResponse<T> {
  data: T;           // Dữ liệu chính (User, List Gói thầu...)
  message: string;   // Thông báo: "Thành công"
  status: number;    // HTTP Status: 200, 400...
  success: boolean;  // True/False
}

// Định nghĩa lỗi
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Lỗi chi tiết từng trường (nếu có)
}