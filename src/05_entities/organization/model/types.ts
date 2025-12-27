// entities/organization/model/types.ts

// Định nghĩa Enum để dễ xử lý logic code (Board vs Department)
export enum UnitType {
  GROUP = "GROUP",           // Tập đoàn
  BLOCK = "BLOCK",           // Khối
  BOARD = "BOARD",           // Ban
  SUBSIDIARY = "SUBSIDIARY", // Công ty con
  DEPARTMENT = "DEPARTMENT", // Phòng
}

export interface OrganizationUnit {
  unitId: number;
  unitName: string;
  unitCode: string;
  parentUnitId: number;
  unitType: UnitType | string; // Cho phép string nhưng ưu tiên Enum
  description?: string;        // Có thể optional vì API trước đó bạn gửi có field này
  managerId: number;
}

export interface UnitMember {
  userId: number;
  fullName: string;
  email: string;
  jobTitle: string;
  role: string;
}