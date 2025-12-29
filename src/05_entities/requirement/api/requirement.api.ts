import { http } from "@/shared/api";
import { PersonnelReq, EquipmentReq } from "../model/types";

export const requirementApi = {
  getPersonnel: (hsmtId: number): Promise<PersonnelReq[]> => {
    return http.get(`/packages_req/${hsmtId}/personnel`);
  },
  
  getEquipment: (hsmtId: number): Promise<EquipmentReq[]> => {
    return http.get(`/packages_req/${hsmtId}/equipment`);
  }
};