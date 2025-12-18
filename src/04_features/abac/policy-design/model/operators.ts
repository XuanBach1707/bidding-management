// src/features/abac/policy-design/model/operators.ts

export const OPERATOR_OPTIONS = {
  eq: { label: "= (Bằng)", types: ["STRING", "NUMBER", "BOOLEAN", "DATETIME"] },
  neq: { label: "!= (Khác)", types: ["STRING", "NUMBER", "BOOLEAN"] },
  gt: { label: "> (Lớn hơn)", types: ["NUMBER", "DATETIME"] },
  lt: { label: "< (Nhỏ hơn)", types: ["NUMBER", "DATETIME"] },
  gte: { label: ">= (Lớn hơn hoặc bằng)", types: ["NUMBER", "DATETIME"] },
  lte: { label: "<= (Nhỏ hơn hoặc bằng)", types: ["NUMBER", "DATETIME"] },
  contains: { label: "CONTAINS (Chứa)", types: ["STRING"] },
  in: { label: "IN (Trong danh sách)", types: ["STRING", "NUMBER"] },
};

// Hàm logic để UI gọi
export const getOperatorsForType = (type: string) => {
  // FIX QUAN TRỌNG: Luôn uppercase type trước khi tìm để tránh lỗi "string" != "STRING"
  const normalizedType = type ? type.toUpperCase() : "STRING";

  const options = Object.entries(OPERATOR_OPTIONS)
    .filter(([_, config]) => config.types.includes(normalizedType))
    .map(([key, config]) => ({ value: key, label: config.label }));
  
  // Fallback: Nếu không tìm thấy toán tử nào, trả về ít nhất là eq
  if (options.length === 0) return [{ value: "eq", label: "=" }];
  
  return options;
};