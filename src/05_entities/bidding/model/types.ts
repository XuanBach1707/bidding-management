// src/entities/bidding/model/types.ts

// 1. Định nghĩa object Gói thầu (Sau khi đã convert camelCase)
export interface BiddingPackage {
  hsmtId: number;
  maTbmt: string;
  tenDuAn: string;
  tenGoiThau: string;
  benMoiThau: string;
  chuDauTu: string;
  linhVuc: string;
  hinhThucLuaChonNhaThau: string;
  trangThai: "NEW" | "PENDING" | "APPROVED" | "REJECTED" | string; // Cần define thêm enum nếu rõ
  ngayDangTai: string;      // ISO Date string
  thoiDiemDongThau: string; // ISO Date string
  thoiDiemMoThau: string;   // ISO Date string
  soTienDamBaoDuThau: string;
  duongDanGoiThau: string;
  createdAt: string;
}

// 2. Định nghĩa Params gửi lên (Query params)
export interface GetBiddingPackagesParams {
  skip?: number;
  limit?: number;
}

// 3. Định nghĩa Base Response (Cấu trúc chung bọc ngoài)
// Bạn có thể đưa interface này vào 'src/shared/api/types.ts' để dùng chung nếu muốn
export interface BaseResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// 4. Định nghĩa Response cụ thể cho API này
export type BiddingPackageListResponse = BaseResponse<BiddingPackage[]>;