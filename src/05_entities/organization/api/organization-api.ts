import { http } from "@/shared/api";
import { OrganizationUnit } from "../model/types"; // Import tạm type từ task hoặc tách riêng

export const organizationApi = {
  getAll: (): Promise<OrganizationUnit[]> => {
    return http.get("/organization/");
  }
};