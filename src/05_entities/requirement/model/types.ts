export interface PersonnelReq {
  id: number;
  hsmtId: number;          // Sửa: hsmt_id -> hsmtId
  stt: number;
  positionName: string;    // Sửa: position_name -> positionName
  quantity: number;
  minExpYears: number;     // Sửa: min_exp_years -> minExpYears
  qualificationReq: string;// Sửa: qualification_req -> qualificationReq
  similarProjectExp: number;// Sửa: similar_project_exp -> similarProjectExp
  createdAt?: string;      // Sửa: created_at -> createdAt
}

export interface EquipmentReq {
  id: number;
  hsmtId: number;          // Sửa: hsmt_id -> hsmtId
  stt: number;
  equipmentName: string;   // Sửa: equipment_name -> equipmentName
  quantity: number;
  specifications: string | null;
  createdAt?: string;      // Sửa: created_at -> createdAt
}

// Union Type
export type RequirementItem = PersonnelReq | EquipmentReq;