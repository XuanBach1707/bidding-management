import { z } from "zod";

// =============================================================================
// 1. COMMON SCHEMAS & UTILS
// =============================================================================

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

export interface GetBiddingPackagesParams {
  skip?: number;
  limit?: number;
  search?: string;
}

// =============================================================================
// 2. MAIN ENTITY (GÓI THẦU & FILES)
// =============================================================================

// Schema Gói thầu chính
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

  // LIÊN KẾT DỰ ÁN
  projectId: z.number().optional().nullable(),

  // TRẠNG THÁI
  trangThai: z.enum(["NEW", "INTERESTED", "NO_GO", "BIDDING", "SUBMITTED", "CLOSED"]).optional().nullable(),

  // PHÂN QUYỀN (Action Based Access Control)
  allowedActions: z.array(z.string()).optional().default([]),

  createdAt: z.string().optional().nullable(),
});

// Schema File đính kèm
export const BiddingFileSchema = z.object({
  fileId: z.number(),
  hsmtId: z.number(),
  fileName: z.string(),
  fileType: z.string(),
  uploadDate: z.string(),
  filePath: z.string(),
});

// =============================================================================
// 3. AI ANALYSIS ENTITIES (MỚI)
// =============================================================================

// 3.1. Thông tin chung (General Info) - MỚI
export const BidGeneralInfoSchema = z.object({
  hsmtId: z.number(),
  maTbmt: z.string(),
  tenGoiThau: z.string(),
  chuDauTu: z.string().optional().nullable(),
  chiTietNguonVon: z.string().optional().nullable(),
  loaiHopDong: z.string().optional().nullable(),
  diaDiemThucHienGoiThau: z.string().optional().nullable(),
  thoiGianThucHienGoiThau: z.string().optional().nullable(),
});

// 3.2. Nhân sự (Personnel)
export const BidPersonnelReqSchema = z.object({
  id: z.number(),
  hsmtId: z.number(),
  stt: z.number().optional().nullable(),
  positionName: z.string(),
  quantity: z.number(),
  minExpYears: z.number().optional().nullable(),
  qualificationReq: z.string().optional().nullable(),
  similarProjectExp: z.number().optional().nullable(),
});

// 3.3. Thiết bị (Equipment)
export const BidEquipmentReqSchema = z.object({
  id: z.number(),
  hsmtId: z.number(),
  stt: z.number().optional().nullable(),
  equipmentName: z.string(),
  quantity: z.number(),
  specifications: z.string().optional().nullable(),
});

// 3.4. Tài chính (Financial)
export const BidFinancialReqSchema = z.object({
  id: z.number(),
  hsmtId: z.number(),
  createdAt: z.string(),

  // Admin Requirements
  bidValidityDays: z.number().optional().nullable(),
  bidSecurityValue: z.string().optional().nullable(),
  bidSecurityDuration: z.number().optional().nullable(),
  submissionFee: z.string().optional().nullable(),
  contractDurationText: z.string().optional().nullable(),

  // Financial Requirements
  reqRevenueAvg: z.string().optional().nullable(),
  reqWorkingCapital: z.string().optional().nullable(),
  reqSimilarContractQty: z.number().optional().nullable(),
  reqSimilarContractValue: z.string().optional().nullable(),
  reqSimilarContractDesc: z.string().optional().nullable(),
});

// 3.5. Object Tổng hợp (Root AI Object)
export const BidAiExtractDataSchema = z.object({
  generalInfo: BidGeneralInfoSchema.optional().nullable(), // Đã thêm
  financial: BidFinancialReqSchema.nullable().optional(),
  personnel: z.array(BidPersonnelReqSchema).default([]),
  equipment: z.array(BidEquipmentReqSchema).default([]),
});

// =============================================================================
// 4. EXPORT TYPES (TYPE INFERENCE)
// =============================================================================

// Main Types
export type BiddingPackage = z.infer<typeof BiddingPackageSchema>;
export type BiddingFile = z.infer<typeof BiddingFileSchema>;

// AI Types
export type BidGeneralInfo = z.infer<typeof BidGeneralInfoSchema>;
export type BidPersonnelReq = z.infer<typeof BidPersonnelReqSchema>;
export type BidEquipmentReq = z.infer<typeof BidEquipmentReqSchema>;
export type BidFinancialReq = z.infer<typeof BidFinancialReqSchema>;
export type BidAiExtractData = z.infer<typeof BidAiExtractDataSchema>;

// API Response Types
export type BiddingPackageListResponse = z.infer<ReturnType<typeof BaseResponseSchema<z.ZodArray<typeof BiddingPackageSchema>>>>;
export type BiddingPackageDetailResponse = z.infer<ReturnType<typeof BaseResponseSchema<typeof BiddingPackageSchema>>>;
export type BiddingPackageFilesResponse = z.infer<ReturnType<typeof BaseResponseSchema<z.ZodArray<typeof BiddingFileSchema>>>>;
export type BidAiExtractResponse = z.infer<ReturnType<typeof BaseResponseSchema<typeof BidAiExtractDataSchema>>>;


