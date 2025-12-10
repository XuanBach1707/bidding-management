// File: 05_entities/project/api/project.api.ts
import axios from 'axios';
import { z } from 'zod';
import { BiddingProject, BiddingProjectSchema, ProjectStatus } from '../model/model';

const PROJECT_API_BASE_URL = '/bidding-projects';

// Schema cho danh sách (Phục vụ Validation)
const BiddingProjectListSchema = z.array(BiddingProjectSchema);

/**
 * [GET] Lấy danh sách các Dự án HSDT đang thực hiện của người dùng hiện tại (hoặc tất cả nếu là admin/manager)
 * @param bidManagerId ID của Chủ trì (Nếu muốn lọc)
 */
export async function getBiddingProjects(bidManagerId?: number): Promise<BiddingProject[]> {
  try {
    const response = await axios.get(PROJECT_API_BASE_URL, {
      params: { bid_manager_id: bidManagerId } // BE thường nhận snake_case
    });
    // Validation và parsing dữ liệu
    return BiddingProjectListSchema.parse(response.data);
  } catch (error) {
    // Xử lý lỗi Zod hoặc Axios
    throw new Error('Lỗi khi tải danh sách dự án đấu thầu.');
  }
}

/**
 * [POST] Khởi tạo Dự án HSDT mới (Từ BiddingPackage đã chọn)
 * @param hsmtId ID của Gói thầu được chọn để tạo dự án
 * @param bidManagerId ID của Chủ trì dự án
 */
export async function createBiddingProject(hsmtId: number, bidManagerId: number): Promise<BiddingProject> {
  const response = await axios.post(PROJECT_API_BASE_URL, {
    hsmt_id: hsmtId, // BE nhận snake_case
    bid_manager_id: bidManagerId, // BE nhận snake_case
  });
  // Validation
  return BiddingProjectSchema.parse(response.data);
}

/**
 * [PATCH] Cập nhật trạng thái Dự án (Ví dụ: Chuyển sang SUBMITTED)
 */
export async function updateProjectStatus(projectId: number, newStatus: ProjectStatus): Promise<BiddingProject> {
  const response = await axios.patch(`${PROJECT_API_BASE_URL}/${projectId}/status`, {
    status: newStatus,
  });
  return BiddingProjectSchema.parse(response.data);
}