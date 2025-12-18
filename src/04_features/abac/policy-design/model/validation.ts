import { AbacConditionGroup, AbacRule } from "@/entities/abac";

// Cấu trúc lỗi trả về
export interface ValidationError {
  path: string;   // Vị trí lỗi (VD: "0-1-2" hoặc "Group Root")
  message: string; // Nội dung lỗi
}

// Helper: Check xem node có phải là Group không (Type Guard)
const isGroup = (node: AbacConditionGroup | AbacRule): node is AbacConditionGroup => {
  return (node as AbacConditionGroup).rules !== undefined;
};

/**
 * Hàm đệ quy validate toàn bộ cây điều kiện
 * @param node Node hiện tại (thường bắt đầu từ Root)
 * @param pathId Chuỗi đại diện đường dẫn (VD: "root", "root-0", "root-0-1")
 * @returns Mảng các lỗi tìm thấy
 */
export const validateConditionNode = (
  node: AbacConditionGroup | AbacRule, 
  pathId: string = "root"
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (isGroup(node)) {
    // 1. Validate Group
    // Logic: Group không được rỗng (phải có ít nhất 1 rule hoặc group con)
    if (node.rules.length === 0) {
      errors.push({
        path: pathId,
        message: "Nhóm điều kiện không được để trống. Hãy thêm ít nhất 1 quy tắc."
      });
    }

    // Đệ quy: Kiểm tra tất cả các con
    node.rules.forEach((child, index) => {
      const childErrors = validateConditionNode(child, `${pathId}-${index}`);
      errors.push(...childErrors);
    });

  } else {
    // 2. Validate Rule (Lá)
    // Rule phải có Field
    if (!node.field || node.field.trim() === "") {
      errors.push({
        path: pathId,
        message: "Chưa chọn thuộc tính (Attribute)."
      });
    }

    // Rule phải có Value (Trừ khi toán tử đặc biệt check null - nếu có)
    // Lưu ý: value có thể là số 0, nên check kỹ
    if (node.value === undefined || node.value === "" || node.value === null) {
      errors.push({
        path: pathId,
        message: "Giá trị không được để trống."
      });
    }
    
    // Validate mảng rỗng (nếu value là array)
    if (Array.isArray(node.value) && node.value.length === 0) {
       errors.push({
        path: pathId,
        message: "Danh sách giá trị không được để trống."
      });
    }
  }

  return errors;
};