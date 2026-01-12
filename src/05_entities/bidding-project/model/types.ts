import { z } from "zod";

// =============================================================================
// 1. DTO (Data Transfer Objects - Gửi đi)
// =============================================================================
export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  sourcePackageId: number; 
}

// =============================================================================
// 2. ENTITIES (Dữ liệu nhận về - Đã qua Interceptor camelCase)
// =============================================================================

// [MỚI] Interface thống kê (Stats) trả về từ API List
export interface BiddingProjectStats {
  deadline: string | null;      // ISO Date
  progress: number;             // 0.0 - 100.0
  totalTasks: number;
  completedTasks: number;
  participantCount: number;
  // priority: string; // Bỏ qua như yêu cầu
}

export interface BiddingPackage {
  hsmtId: number;        
  maTbmt: string;
  tenGoiThau: string;    
  trangThai: string;      
  ngayDangTai: string;
  
  // [CẬP NHẬT] Các trường thông tin bổ sung
  thoiDiemDongThau?: string; // Thời điểm đóng thầu
  chuDauTu?: string;         // Chủ đầu tư
  diaDiem?: string;          // Địa điểm
  linhVuc?: string;          // Lĩnh vực (Xây lắp, Hàng hóa...)
  
  maKhlcnt?: string;      
  benMoiThau?: string;    
}

export interface BiddingProject {
  id: number;
  name: string;
  status: string;        
  hostId: number;
  
  bidTeamLeaderId: number;
  // [CẬP NHẬT] Tên Leader
  bidTeamLeaderName?: string;
  
  driveFolderId?: string; 
  
  createdAt: string;
  updatedAt: string;
  
  packages?: BiddingPackage[]; 
  
  // [CẬP NHẬT] Object stats đi kèm
  stats?: BiddingProjectStats;
}

// =============================================================================
// 3. SCHEMA & TYPE CHO NHÂN SỰ
// =============================================================================
export const ProjectPersonnelSchema = z.object({
  userId: z.number(),           
  fullName: z.string(),         
  email: z.string(),
  role: z.string(),             
  avatarUrl: z.string().nullable().optional(), 
  
  orgUnitId: z.number().optional(),   
  orgUnitName: z.string().optional(), 
  jobTitle: z.string().optional(),    
  
  securityClearance: z.number().optional(), 
  status: z.boolean().optional(),
  
  parentOrgUnitName: z.string().nullable().optional() 
});

export type ProjectPersonnel = z.infer<typeof ProjectPersonnelSchema>;