import { z } from "zod";

// =============================================================================
// 1. DTO (Data Transfer Objects - Gửi đi)
// =============================================================================
export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  // Interceptor sẽ tự đổi cái này thành 'source_package_id' khi gửi request
  sourcePackageId: number; 
}

// =============================================================================
// 2. ENTITIES (Dữ liệu nhận về - Đã qua Interceptor camelCase)
// =============================================================================

// Khớp với JSON: { "hsmt_id": 9, "trang_thai": "BIDDING", ... }
export interface BiddingPackage {
  hsmtId: number;        
  maTbmt: string;
  tenGoiThau: string;    
  trangThai: string;      
  ngayDangTai: string;
  
  // Các trường bổ sung
  maKhlcnt?: string;      
  benMoiThau?: string;    
  linhVuc?: string;
}

export interface BiddingProject {
  id: number;
  name: string;
  status: string;        // "New", "COMPLETED", ...
  hostId: number;
  bidTeamLeaderId: number;
  
  driveFolderId?: string; 
  
  createdAt: string;
  updatedAt: string;
  
  packages?: BiddingPackage[]; 
}

// [MỚI] Schema & Type cho Nhân sự (Để phục vụ màn hình danh sách nhân viên)
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