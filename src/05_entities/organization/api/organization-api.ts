import { http } from "@/shared/api";
import { OrganizationUnit, UnitMember } from "../model/types";

export const organizationApi = {
  /**
   * 1. Lấy danh sách các Ban (Boards)
   * GET /organization/boards
   */
  getBoards: (): Promise<OrganizationUnit[]> => {
    return http.get("/organization/boards");
  },

  /**
   * 2. Lấy danh sách Phòng (Departments) thuộc một Ban cụ thể
   * GET /organization/boards/{boardId}/departments
   */
  getDepartments: (boardId: number | string): Promise<OrganizationUnit[]> => {
    return http.get(`/organization/boards/${boardId}/departments`);
  },

  /**
   * 3. Lấy danh sách thành viên thuộc một đơn vị (Ban hoặc Phòng)
   * GET /organization/{unitId}/members
   */
  getUnitMembers: (unitId: number | string): Promise<UnitMember[]> => {
    return http.get(`/organization/${unitId}/members`);
  }
};