import { z } from "zod";

// --- 1. COMMON SCHEMAS & TYPES ---

export interface BaseResponse<T> {
  success: boolean;
  status: number;
  message?: string | null;
  data: T;
}

export const BaseResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    status: z.number(),
    message: z.string().optional().nullable(),
    data: dataSchema,
  });

// --- 2. MAIN ENTITY SCHEMA (Gói thầu) ---
export const BiddingPackageSchema = z.object({
  hsmtId: z.number(),
  maTbmt: z.string(),
  phienBanThayDoi: z.string().optional().nullable(),
  ngayDangTai: z.string(),
  
  // Nhóm KHLCNT
  maKhlcnt: z.string().optional().nullable(),
  phanLoaiKhlcnt: z.string().optional().nullable(),
  tenDuAn: z.string().optional().nullable(),
  
  // Nhóm Thông tin gói thầu
  quyTrinhApDung: z.string().optional().nullable(),
  tenGoiThau: z.string(),
  chuDauTu: z.string().optional().nullable(),
  chiTietNguonVon: z.string().optional().nullable(),
  linhVuc: z.string().optional().nullable(),
  hinhThucLuaChonNhaThau: z.string().optional().nullable(),
  loaiHopDong: z.string().optional().nullable(),
  trongNuocHoacQuocTe: z.string().optional().nullable(),
  phuongThucLuaChonNhaThau: z.string().optional().nullable(),
  thoiGianThucHienGoiThau: z.string().optional().nullable(),
  
  // Nhóm khác
  goiThauCoNhieuPhanLo: z.string().optional().nullable(),
  hinhThucDuThau: z.string().optional().nullable(),
  diaDiemPhatHanhEHsmt: z.string().optional().nullable(),
  chiPhiNop: z.string().optional().nullable(),
  diaDiemNhanEHsdt: z.string().optional().nullable(),
  diaDiemThucHienGoiThau: z.string().optional().nullable(),
  thoiDiemDongThau: z.string().optional().nullable(),
  thoiDiemMoThau: z.string().optional().nullable(),
  diaDiemMoThau: z.string().optional().nullable(),
  hieuLucHsdt: z.string().optional().nullable(),
  soTienDamBaoDuThau: z.string().optional().nullable(),
  hinhThucDamBaoDuThau: z.string().optional().nullable(),
  loaiCongTrinh: z.string().optional().nullable(),
  soQuyetDinhPheDuyet: z.string().optional().nullable(),
  ngayPheDuyet: z.string().optional().nullable(),
  coQuanBanHanhQuyetDinh: z.string().optional().nullable(),
  quyetDinhPheDuyet: z.string().optional().nullable(),
  duongDanGoiThau: z.string().optional().nullable(),
  
  // TRẠNG THÁI: Chuyển thành Enum/Literal để hết lỗi .includes()
  trangThai: z.enum(["NEW", "INTERESTED", "NO_GO", "BIDDING", "SUBMITTED", "CLOSED"]).optional().nullable(),
  
  // PHÂN QUYỀN: Thêm trường allowedActions từ Backend (đã qua Interceptor convert)
  allowedActions: z.array(z.string()).optional().default([]),
  
  createdAt: z.string(),
});

// --- 3. FILES SCHEMA ---
export const BiddingFileSchema = z.object({
  fileId: z.number(),
  hsmtId: z.number(),
  fileName: z.string(),
  fileType: z.string(),
  uploadDate: z.string(),
  filePath: z.string(),
});

// --- 4. EXPORT TYPES ---
export type BiddingPackage = z.infer<typeof BiddingPackageSchema>;
export type BiddingFile = z.infer<typeof BiddingFileSchema>;

// [FIX] Cập nhật Params hỗ trợ Search cho BiddingList
export interface GetBiddingPackagesParams {
  skip?: number;
  limit?: number;
  search?: string; // Thêm search ở đây
}

// Response Types
export type BiddingPackageListResponse = z.infer<ReturnType<typeof BaseResponseSchema<z.ZodArray<typeof BiddingPackageSchema>>>>;
export type BiddingPackageDetailResponse = z.infer<ReturnType<typeof BaseResponseSchema<z.ZodArray<typeof BiddingPackageSchema>>>>;
export type BiddingPackageFilesResponse = z.infer<ReturnType<typeof BaseResponseSchema<z.ZodArray<typeof BiddingFileSchema>>>>;