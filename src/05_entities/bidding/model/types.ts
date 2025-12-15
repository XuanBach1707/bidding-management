// src/entities/bidding/model/types.ts

// --- 1. COMMON TYPES ---
export interface BaseResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// --- 2. MAIN ENTITY (Gói thầu) ---
export interface BiddingPackage {
  hsmtId: number;
  maTbmt: string;
  phienBanThayDoi: string;
  ngayDangTai: string;
  
  // Nhóm KHLCNT
  maKhlcnt: string;
  phanLoaiKhlcnt: string;
  tenDuAn: string; 
  
  // Nhóm Thông tin gói thầu
  quyTrinhApDung: string;
  tenGoiThau: string;
  chuDauTu: string;
  chiTietNguonVon: string;
  linhVuc: string;
  hinhThucLuaChonNhaThau: string;
  loaiHopDong: string;
  trongNuocHoacQuocTe: string;
  phuongThucLuaChonNhaThau: string;
  thoiGianThucHienGoiThau: string;
  
  // Nhóm khác
  goiThauCoNhieuPhanLo: string;
  hinhThucDuThau: string;
  diaDiemPhatHanhEHsmt: string;
  chiPhiNop: string;
  diaDiemNhanEHsdt: string;
  diaDiemThucHienGoiThau: string;
  thoiDiemDongThau: string;
  thoiDiemMoThau: string;
  diaDiemMoThau: string;
  hieuLucHsdt: string;
  soTienDamBaoDuThau: string;
  hinhThucDamBaoDuThau: string;
  loaiCongTrinh: string;
  soQuyetDinhPheDuyet: string;
  ngayPheDuyet: string;
  coQuanBanHanhQuyetDinh: string;
  quyetDinhPheDuyet: string;
  duongDanGoiThau: string;
  trangThai: string; 
  createdAt: string;
}

// --- 3. PARAMS & RESPONSES ---

// [QUAN TRỌNG] Params cho API danh sách (cái đang bị lỗi thiếu)
export interface GetBiddingPackagesParams {
  skip?: number;
  limit?: number;
}

// Response danh sách
export type BiddingPackageListResponse = BaseResponse<BiddingPackage[]>;

// Response chi tiết (API trả về mảng 1 phần tử)
export type BiddingPackageDetailResponse = BaseResponse<BiddingPackage[]>;

// --- 4. FILES ---
export interface BiddingFile {
  fileId: number;
  hsmtId: number;
  fileName: string;
  fileType: string;
  uploadDate: string;
  filePath: string;
}

// Response danh sách file
export type BiddingPackageFilesResponse = BaseResponse<BiddingFile[]>;