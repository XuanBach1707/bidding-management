import { http } from "@/shared/api";
import { BiddingProject, CreateBiddingProjectDto, BiddingPackage } from "../model/types";

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
   */
  update: (id: number, data: Partial<CreateBiddingProjectDto>): Promise<BiddingProject> => {
    return http.put(`/bidding-projects/${id}/`, data) as Promise<BiddingProject>;
  },

  /**
   * GET /bidding-packages/by-project/{projectId}
   * Lấy thông tin gói thầu E-HSMT liên kết với dự án
   * (SỬA: Type trả về là BiddingPackage chuẩn camelCase)
   */
  getByProject: (projectId: number): Promise<{ data: BiddingPackage }> => {
    return http.get(`/bidding-packages/by-project/${projectId}`);
  },

  /**
   * DELETE /bidding-projects/{project_id}
   * Xóa dự án
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/bidding-projects/${id}/`) as Promise<void>;
  }
};