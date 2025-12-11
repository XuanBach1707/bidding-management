// src/types/dynamic-view.ts

export interface FieldItem {
  key: string;        // ID duy nhất của trường (để làm key cho React)
  label: string;      // Tên hiển thị (VD: Mã TBMT)
  value: string | number | null | undefined; // Giá trị
  fullWidth?: boolean; // True: Chiếm cả dòng (col-span-2), False: Chia đôi
}

export interface SectionGroup {
  id: string;
  title: string;      // Tiêu đề khối (VD: Thông tin cơ bản)
  fields: FieldItem[];
}