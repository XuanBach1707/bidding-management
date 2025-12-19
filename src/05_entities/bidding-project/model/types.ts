export interface BiddingPackage {
  hsmtId: number;
  maTbmt: string;
  tenGoiThau: string;
  trangThai: string;
  ngayDangTai: string;
}

export interface BiddingProject {
  id: number;
  name: string;
  status: string;
  hostId: number;
  bidTeamLeaderId: number;
  createdAt: string;
  updatedAt: string;
  packages: BiddingPackage[];
}

export interface CreateBiddingProjectDto {
  name: string;
  status?: string;
  sourcePackageId: number; // Interceptor sẽ tự đổi thành source_package_id
}