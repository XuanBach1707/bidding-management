import { http } from "@/shared/api";
import { Rule, ApiResponse } from "../index";

const ENDPOINT = "/crawler-config/rules";

export const ruleApi = {
  getAll: async (): Promise<Rule[]> => {
    // Ép kiểu về ApiResponse để khớp với hành vi của Interceptor
    const res = await http.get<ApiResponse<Rule[]>>(ENDPOINT) as unknown as ApiResponse<Rule[]>;
    return res.data;
  },

  create: async (data: Omit<Rule, "id">): Promise<Rule> => {
    const res = await http.post<ApiResponse<Rule>>(ENDPOINT, data) as unknown as ApiResponse<Rule>;
    return res.data;
  },

  update: async (id: number, data: Partial<Rule>): Promise<Rule> => {
    const res = await http.put<ApiResponse<Rule>>(`${ENDPOINT}/${id}`, data) as unknown as ApiResponse<Rule>;
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${ENDPOINT}/${id}`);
  },
};