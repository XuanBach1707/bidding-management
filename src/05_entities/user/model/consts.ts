// src/entities/user/model/consts.ts

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  BID_MANAGER = "BID_MANAGER",
  SPECIALIST = "SPECIALIST",
  ENGINEER = "ENGINEER",
  JKAN = "JKAN",
}

export enum SecurityLevel {
  PUBLIC = 1,       // Công khai
  INTERNAL = 2,     // Nội bộ
  CONFIDENTIAL = 3, // Mật
  SECRET = 4,       // Tối mật
}

// Map label tiếng Việt để hiển thị UI (nếu cần)
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Quản trị viên",
  [UserRole.MANAGER]: "Lãnh đạo",
  [UserRole.BID_MANAGER]: "Chủ trì / Trưởng phòng",
  [UserRole.SPECIALIST]: "Chuyên viên",
  [UserRole.ENGINEER]: "Kỹ sư",
  [UserRole.JKAN]: "Thành viên dự án (JKAN)",
};

export const SECURITY_LEVEL_LABELS: Record<SecurityLevel, string> = {
  [SecurityLevel.PUBLIC]: "Công khai (Level 1)",
  [SecurityLevel.INTERNAL]: "Nội bộ (Level 2)",
  [SecurityLevel.CONFIDENTIAL]: "Mật (Level 3)",
  [SecurityLevel.SECRET]: "Tối mật (Level 4)",
};