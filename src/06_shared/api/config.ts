// src/shared/api/config.ts

/**
 * DANH SÁCH CÁC API BẮT BUỘC PHẢI CÓ DẤU GẠCH CHÉO (/) Ở CUỐI
 * -----------------------------------------------------------
 * Dựa trên Swagger:
 * - Những API dạng CRUD truyền thống (thường là Python/Django) được định nghĩa là /resource/
 * - Nếu thiếu dấu /, Backend trả về 307 -> Browser tự redirect sang IP gốc -> Mất Cookie -> Lỗi 401.
 * * Interceptor sẽ tự động kiểm tra: Nếu URL chứa các từ khóa này mà chưa có /, nó sẽ tự thêm vào.
 */
export const FORCE_SLASH_PATHS = [
    // 1. Bidding Packages (Đã confirm lỗi 307)
    '/bidding-packages',
    
    // 2. Package Requirements (Thường đi kèm Bidding)
    '/packages_req',
    
    // 3. Crawler Config
    '/crawler-config',
    
    // 4. Organization (Swagger ghi rõ: GET /organization/)
    '/organization',
    
    // 5. User Management (Swagger ghi rõ: POST /users/)
    // Lưu ý: Auth (/auth/...) KHÔNG nằm trong này
    '/users',
    
    // 6. ABAC (Swagger ghi rõ: GET /abac/attributes/)
    '/abac',
    
    // 7. System
    '/system',
    
    // 8. Bidding Projects (Swagger ghi rõ: GET /bidding-projects/)
    '/bidding-projects',
];

/**
 * LƯU Ý CÁC MODULE KHÔNG ĐƯỢC THÊM VÀO ĐÂY (VÌ SẼ LỖI):
 * - /auth (Login/Logout kỵ dấu /)
 * - /tasks (Bạn đã test và thấy thêm / bị lỗi 307/404)
 * - /drive, /onedrive (API file thường không có /)
 * - /drafting, /ai-bidding, /agent-interface, /googlelogin
 */