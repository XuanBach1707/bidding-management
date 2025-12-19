import { http } from '@/shared/api';
import { AttributeSchema, PolicySchema } from '../model/schemas';
import { AbacAttribute, AbacPolicy, CreatePolicyDto } from '../model/types';

/**
 * API Service cho module ABAC
 * Lưu ý: Tất cả các request gửi đi đều kèm header 'x-no-transform' để bảo vệ 
 * cấu trúc dữ liệu JSON (đặc biệt là các mảng trong condition_json).
 */
export const abacApi = {
  // ==========================================
  // 1. ATTRIBUTES (Từ điển thuộc tính)
  // ==========================================
  
  // Lấy danh sách Attributes
  getAttributes: async (): Promise<AbacAttribute[]> => {
    const response = await http.get('/abac/attributes/', {
      headers: { 'x-no-transform': 'true' } 
    });
    
    const result = AttributeSchema.array().safeParse(response);
    if (!result.success) {
      console.error("Zod Validation Error (Attributes):", result.error);
      return []; 
    }
    return result.data;
  },

  // Tạo Attribute mới
  createAttribute: async (data: Omit<AbacAttribute, 'id'>) => {
    return http.post('/abac/attributes/', data, {
      headers: { 'x-no-transform': 'true' }
    });
  },

  // Cập nhật Attribute
  updateAttribute: async (id: number, data: Omit<AbacAttribute, 'id'>) => {
    return http.put(`/abac/attributes/${id}`, data, {
      headers: { 'x-no-transform': 'true' }
    });
  },

  // Xóa Attribute
  deleteAttribute: async (id: number) => {
    return http.delete(`/abac/attributes/${id}`);
  },

  // ==========================================
  // 2. POLICIES (Chính sách truy cập)
  // ==========================================

  // Lấy danh sách Policies
  getPolicies: async (): Promise<AbacPolicy[]> => {
    const response = await http.get('/abac/policies/', {
      headers: { 'x-no-transform': 'true' }
    });
    
    const result = PolicySchema.array().safeParse(response);
    if (!result.success) {
      console.error("Zod Validation Error (Policies):", result.error);
      return [];
    }
    return result.data;
  },

  // Tạo Policy mới
  createPolicy: async (data: CreatePolicyDto, extraConfig?: any) => {
    // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
    const validation = PolicySchema.omit({ 
        id: true, 
        created_at: true, 
        updated_at: true 
    }).safeParse(data);

    if (!validation.success) {
        // Log cảnh báo nhưng vẫn cho phép gửi đi để kiểm tra thực tế
        console.warn("Zod Validation Warning (Create Policy):", validation.error.message);
    }

    return http.post('/abac/policies/', data, {
      ...extraConfig,
      headers: { 
        'x-no-transform': 'true',
        ...extraConfig?.headers 
      }
    });
  },

  // Cập nhật Policy
  updatePolicy: async (id: number, data: CreatePolicyDto, extraConfig?: any) => {
    const validation = PolicySchema.omit({ 
        id: true, 
        created_at: true, 
        updated_at: true 
    }).safeParse(data);

    if (!validation.success) {
        console.warn("Zod Validation Warning (Update Policy):", validation.error.message);
    }

    return http.put(`/abac/policies/${id}`, data, {
      ...extraConfig,
      headers: { 
        'x-no-transform': 'true',
        ...extraConfig?.headers 
      }
    });
  },
  
  // Xóa Policy
  deletePolicy: async (id: number) => {
    return http.delete(`/abac/policies/${id}`);
  },

  // ==========================================
  // 3. SYSTEM (Tiện ích hệ thống)
  // ==========================================

  // Lấy danh sách bảng hệ thống để làm Resource Dropdown
  getSystemTables: async (): Promise<string[]> => {
    try {
        const response: any = await http.get('/system/tables', {
            headers: { 'x-no-transform': 'true' }
        }); 
        return response.tables || [];
    } catch (error) {
        console.error("Failed to fetch system tables", error);
        return [];
    }
  },

  // Lấy danh sách Actions từ hệ thống
  getActions: async (): Promise<string[]> => {
    try {
      const response: any = await http.get('/system/actions', {
          headers: { 'x-no-transform': 'true' }
      });
      // Trích xuất mảng string từ field 'data' trong response
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch system actions", error);
      return [];
    }
  }
};