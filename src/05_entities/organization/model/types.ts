// src/entities/organization/model/types.ts (hoặc file chứa OrganizationUnit)

export interface OrganizationUnit {
  unitId: number;
  unitName: string;
  unitCode: string;
  parentUnitId: number;
  unitType: string;
  managerId: number;
}

// Thêm interface này để mapping dữ liệu từ API mới
export interface UnitMember {
  userId: number;
  fullName: string;
  email: string;
  jobTitle: string;
  role: string;
}