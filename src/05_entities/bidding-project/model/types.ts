// 1. DTO gửi đi (Khớp với Schema)
export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  sourcePackageId: number; // Interceptor sẽ đổi thành source_package_id
}

// 2. Entity con: Gói thầu (lồng trong dự án)
export interface BiddingPackage {
  hsmtId: number;
  maTbmt: string;
  tenGoiThau: string;
  trangThai: string;
  ngayDangTai: string;
}

// 3. Entity chính: Dự án đấu thầu (Response từ BE)
export interface BiddingProject {
  id: number;
  name: string;
  status: string;
  hostId: number;
  bidTeamLeaderId: number;
  createdAt: string;
  updatedAt: string;
  packages: BiddingPackage[]; // Mảng gói thầu liên quan
}