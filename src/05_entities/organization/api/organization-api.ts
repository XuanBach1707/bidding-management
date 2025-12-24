import { http } from "@/shared/api";
import { OrganizationUnit, UnitMember } from "../model/types";

export const organizationApi = {
  /**
   * 1. Lấy danh sách tất cả các phòng ban trong hệ thống
   * Dùng để đổ vào Select chọn "Phòng ban chủ trì" (Host Unit)
   */
  getAll: (): Promise<OrganizationUnit[]> => {
    return http.get("/organization/");
  },

  /**
   * 2. Lấy danh sách thành viên thuộc một phòng ban cụ thể
   * @param unitId ID của phòng ban (lấy từ kết quả của API getAll)
   * Interceptor sẽ tự convert: user_id -> userId, full_name -> fullName...
   */
  getUnitMembers: (unitId: number | string): Promise<UnitMember[]> => {
    return http.get(`/organization/${unitId}/members`);
  }
};