import { z } from 'zod';

// ==========================================
// 1. ATTRIBUTE SCHEMA
// ==========================================

// SỬA ĐOẠN NÀY: Logic "ép kiểu" mạnh tay
export const AttributeTypeSchema = z.preprocess(
  (val) => {
    if (!val) return "STRING"; // Null/Undefined -> STRING
    
    const s = String(val).toUpperCase();
    
    // 1. Map các kiểu lạ về kiểu chuẩn (nếu Backend trả về kiểu SQL)
    if (["INT", "INTEGER", "FLOAT", "DECIMAL", "DOUBLE"].includes(s)) return "NUMBER";
    if (["TEXT", "CHAR", "VARCHAR"].includes(s)) return "STRING";
    if (["BOOL"].includes(s)) return "BOOLEAN";
    if (["DATE", "TIMESTAMP"].includes(s)) return "DATETIME";

    // 2. Nếu đúng kiểu chuẩn rồi thì giữ nguyên
    if (["STRING", "NUMBER", "BOOLEAN", "DATETIME"].includes(s)) return s;

    // 3. Fallback: Nếu vẫn lạ hoắc (VD: "JSON", "LIST") -> Coi như STRING để không crash App
    return "STRING"; 
  },
  z.enum(["STRING", "NUMBER", "BOOLEAN", "DATETIME"])
);

export const AttributeSchema = z.object({
  id: z.number(),
  attr_key: z.string().min(1, "Key không được để trống"), 
  attr_type: AttributeTypeSchema, // Đã được bọc giáp chống lỗi
  source_table: z.string().nullable().optional(), 
  description: z.string().optional(),
});

// ==========================================
// 2. POLICY CONDITION SCHEMA (Giữ nguyên)
// ==========================================

export const RuleSchema = z.object({
  field: z.string().min(1, "Vui lòng chọn thuộc tính"),
  operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "in", "contains"]),
  value: z.union([
    z.string(), 
    z.number(), 
    z.boolean(), 
    z.array(z.string()), 
    z.array(z.number())
  ]), 
});

export type ConditionGroup = {
  condition: "AND" | "OR";
  rules: (z.infer<typeof RuleSchema> | ConditionGroup)[];
};

export const ConditionGroupSchema: z.ZodType<ConditionGroup> = z.lazy(() => 
  z.object({
    condition: z.enum(["AND", "OR"]),
    rules: z.array(z.union([RuleSchema, ConditionGroupSchema])),
  })
);

// ==========================================
// 3. POLICY SCHEMA (Giữ nguyên)
// ==========================================
export const PolicySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Tên chính sách phải dài hơn 3 ký tự"),
  description: z.string().optional(),
  target_resource: z.string().min(1, "Phải chọn Resource"),
  action: z.array(z.string()).min(1, "Phải chọn ít nhất 1 hành động"), 
  effect: z.enum(["ALLOW", "DENY"]),
  priority: z.number().int().min(1).default(1),
  condition_json: ConditionGroupSchema, 
  is_active: z.boolean().default(true),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});