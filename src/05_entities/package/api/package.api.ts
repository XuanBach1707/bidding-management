// File: 05_entities/package/api/package.api.ts
import axios from 'axios';
import { z } from 'zod';
import { BiddingPackage, BiddingPackageSchema, PackageStatus, PackageStatusSchema } from '../model/model';

const PACKAGE_API_BASE_URL = '/bidding-packages';

// Schema cho danh sách (Phục vụ Validation)
const BiddingPackageListSchema = z.array(BiddingPackageSchema);

/**
 * [GET] Lấy danh sách gói thầu (Thường dùng cho màn hình Danh sách Gói thầu)
 * @param params Các tham số lọc, sắp xếp (status, field, page, limit...)
 */
export async function getBiddingPackages(params?: Record<string, any>): Promise<BiddingPackage[]> {
  try {
    const response = await axios.get(PACKAGE_API_BASE_URL, { params });
    // Validation và parsing dữ liệu
    return BiddingPackageListSchema.parse(response.data);
  } catch (error) {
    // Xử lý lỗi Zod hoặc Axios
    throw new Error('Lỗi khi tải danh sách gói thầu.');
  }
}

/**
 * [GET] Lấy chi tiết một gói thầu theo ID
 */
export async function getBiddingPackageDetail(hsmtId: number): Promise<BiddingPackage> {
  const response = await axios.get(`${PACKAGE_API_BASE_URL}/${hsmtId}`);
  // Validation
  return BiddingPackageSchema.parse(response.data);
}

/**
 * [PATCH] Cập nhật trạng thái gói thầu (Ví dụ: Từ NEW sang REVIEWING)
 */
export async function updatePackageStatus(hsmtId: number, newStatus: PackageStatus): Promise<BiddingPackage> {
  const response = await axios.patch(`${PACKAGE_API_BASE_URL}/${hsmtId}/status`, {
    status: newStatus,
  });
  return BiddingPackageSchema.parse(response.data);
}

