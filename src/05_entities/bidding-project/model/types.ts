// 1. DTO gửi đi (Dữ liệu tạo dự án)
export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  sourcePackageId: number; 
}

// 2. Entity: Thông tin Gói thầu (Lấy từ E-HSMT)
// Khớp với JSON response camelCase bạn đã show
export interface BiddingPackage {
  hsmtId: number;         // Quan trọng để fetch Requirements
  maTbmt: string;
  tenGoiThau: string;
  trangThai: string;      // BIDDING, v.v.
  ngayDangTai: string;
  maKhlcnt: string;       // Bổ sung từ JSON
  benMoiThau: string;     // Bổ sung từ JSON (chuDauTu)
  linhVuc: string;
}

// 3. Entity chính: Dự án đấu thầu (Của hệ thống mình)
export interface BiddingProject {
  id: number;
  name: string;
  status: string;
  hostId: number;
  bidTeamLeaderId: number;
  createdAt: string;
  updatedAt: string;
  
  // Lưu ý: Nếu logic dự án của bạn là 1 Dự án - 1 Gói thầu 
  // thì chỗ này có thể là object thay vì array. 
  // Nhưng để an toàn theo definition của bạn thì cứ để array.
  packages?: BiddingPackage[]; 
}