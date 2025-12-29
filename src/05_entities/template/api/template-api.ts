import { http } from "@/shared/api"; 
import { Template } from "../model/types";
// import { TemplateSchema } from "../model/schemas"; // Có thể dùng để parse nếu muốn strict validation

export const templateApi = {
  getList: async (): Promise<Template[]> => {
    const response = await http.get<any, Template[]>('/drafting/templates');
    // Nếu muốn validate chặt chẽ dữ liệu trả về, bạn có thể dùng:
    // return z.array(TemplateSchema).parse(response);
    
    // Còn nếu tin tưởng backend và interceptor thì return luôn:
    return response;
  }
};