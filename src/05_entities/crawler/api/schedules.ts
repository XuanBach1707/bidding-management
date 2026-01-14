import { http } from "@/shared/api";
import { Schedule, ApiResponse } from "../";

const ENDPOINT = "/crawler-config/schedules";

export const scheduleApi = {
  getAll: async (): Promise<Schedule[]> => {
    // FIX: Ép kiểu kết quả trả về thành ApiResponse<Schedule[]> thay vì để mặc định là AxiosResponse
    const res = await http.get<ApiResponse<Schedule[]>>(ENDPOINT) as unknown as ApiResponse<Schedule[]>;
    return res.data; 
  },

  create: async (data: Omit<Schedule, "id">): Promise<Schedule> => {
    const res = await http.post<ApiResponse<Schedule>>(ENDPOINT, data) as unknown as ApiResponse<Schedule>;
    return res.data;
  },

  update: async (id: number, data: Partial<Schedule>): Promise<Schedule> => {
    const res = await http.put<ApiResponse<Schedule>>(`${ENDPOINT}/${id}`, data) as unknown as ApiResponse<Schedule>;
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${ENDPOINT}/${id}`);
  },
};