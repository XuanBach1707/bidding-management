import { http } from "@/shared/api";
import { BiddingProject, CreateBiddingProjectDto } from "../model/types";

export const biddingProjectApi = {
  /**
   * POST /bidding-projects/
   * Khởi tạo dự án mới
   */
  create: (data: CreateBiddingProjectDto): Promise<BiddingProject> => {
    return http.post("/bidding-projects/", data);
  },

  /**
   * GET /bidding-projects/
   * Lấy danh sách các dự án (Read Projects)
   */
  getAll: (): Promise<BiddingProject[]> => {
    return http.get("/bidding-projects/");
  },

  /**
   * GET /bidding-projects/{project_id}
   * Lấy chi tiết một dự án (Read Project)
   */
  getById: (id: number): Promise<BiddingProject> => {
    return http.get(`/bidding-projects/${id}/`);
  },

  /**
   * PUT /bidding-projects/{project_id}
   * Cập nhật thông tin dự án (Update Project)
   * Sử dụng Partial để có thể cập nhật lẻ name, hostId hoặc bidTeamLeaderId
   */
  update: (id: number, data: Partial<BiddingProject>): Promise<BiddingProject> => {
    return http.put(`/bidding-projects/${id}/`, data);
  },

  /**
   * DELETE /bidding-projects/{project_id}
   * Xóa dự án (Delete Project)
   */
  delete: (id: number): Promise<void> => {
    return http.delete(`/bidding-projects/${id}/`);
  }
};