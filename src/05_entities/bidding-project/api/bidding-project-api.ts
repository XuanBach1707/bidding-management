import { http } from "@/shared/api";
import { BiddingProject, CreateBiddingProjectDto } from "../model/types";

export const biddingProjectApi = {
  /**
   * POST /bidding-projects/
   * Khởi tạo dự án mới
   */
  create: (data: CreateBiddingProjectDto): Promise<BiddingProject> => {
    return http.post("/bidding-projects/", data) as Promise<BiddingProject>;
  },

  /**
   * GET /bidding-projects/
   * Lấy danh sách các dự án
   */
  getAll: (): Promise<BiddingProject[]> => {
    return http.get("/bidding-projects/") as Promise<BiddingProject[]>;
  },

  /**
   * GET /bidding-projects/{project_id}
   * Lấy chi tiết một dự án
   */
  getById: (id: number): Promise<BiddingProject> => {
    return http.get(`/bidding-projects/${id}/`) as Promise<BiddingProject>;
  },

  /**
   * PUT /bidding-projects/{project_id}
   * Cập nhật thông tin dự án
   * Lưu ý: Dùng Partial<CreateBiddingProjectDto> để chỉ cho phép sửa các trường 
   * như name, status... tránh gửi nhầm packages hay createdAt lên.
   */
  update: (id: number, data: Partial<CreateBiddingProjectDto>): Promise<BiddingProject> => {
    return http.put(`/bidding-projects/${id}/`, data) as Promise<BiddingProject>;
  },

  /**
   * DELETE /bidding-projects/{project_id}
   * Xóa dự án
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/bidding-projects/${id}/`) as Promise<void>;
  }
};