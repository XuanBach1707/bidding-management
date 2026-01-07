export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  // Interceptor sẽ tự đổi cái này thành 'source_package_id' khi gửi request
  sourcePackageId: number; 
}

// =============================================================================
// 3. ENTITIES (Dữ liệu nhận về - Đã qua Interceptor camelCase)
// =============================================================================

// Khớp với JSON: { "hsmt_id": 9, "trang_thai": "BIDDING", ... }
export interface BiddingPackage {
  hsmtId: number;        
  maTbmt: string;
  tenGoiThau: string;    
  trangThai: string;      // [QUAN TRỌNG] Đã sửa đúng camelCase để khớp logic đếm
  ngayDangTai: string;
  
  // Các trường bổ sung (nếu API có trả về)
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
  
  // [QUAN TRỌNG] Logic mở Drive folder sẽ dùng cái này
  driveFolderId?: string; 
  
  createdAt: string;
  updatedAt: string;
  
  packages?: BiddingPackage[]; 
}