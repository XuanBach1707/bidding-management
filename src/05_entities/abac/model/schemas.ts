import { z } from 'zod';

// ==========================================
// 1. ATTRIBUTE SCHEMA
// ==========================================

export const AttributeTypeSchema = z.preprocess(
  (val) => {
    if (!val) return "STRING";
    
    const s = String(val).toUpperCase();
    
    // 1. Giữ nguyên hoặc Map về đúng Enum của Backend để tránh Payload sai lệch
    if (["INTEGER", "INT"].includes(s)) return "INTEGER";
    if (["DECIMAL", "FLOAT", "DOUBLE", "NUMBER"].includes(s)) return "DECIMAL";
    if (["BOOLEAN", "BOOL"].includes(s)) return "BOOLEAN";
    if (["LIST", "ARRAY", "JSON"].includes(s)) return "LIST";
    if (["DATETIME", "TIMESTAMP", "DATE"].includes(s)) return "DATETIME";

    // 2. Mặc định là STRING cho các kiểu TEXT, VARCHAR hoặc không xác định
    return "STRING"; 
  },
  // Enum này phải khớp chính xác với các giá trị Backend mong đợi trong Payload
  z.enum(["STRING", "INTEGER", "DECIMAL", "BOOLEAN", "LIST", "DATETIME"]) 
);

export const AttributeSchema = z.object({
  id: z.number(),
  attr_key: z.string().min(1, "Key không được để trống"),
  attr_type: AttributeTypeSchema,
  source_table: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mapping_path: z.string().nullable().optional(), // Trường từ Backend
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
// 3. POLICY SCHEMA
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