import { z } from 'zod';
import { 
  AttributeSchema, 
  PolicySchema, 
  RuleSchema, 
  ConditionGroupSchema,
  AttributeTypeSchema 
} from './schemas';

// Tạo Type từ Schema
export type AttributeType = z.infer<typeof AttributeTypeSchema>; 
export type AbacAttribute = z.infer<typeof AttributeSchema>;
export type AbacPolicy = z.infer<typeof PolicySchema>;
export type AbacRule = z.infer<typeof RuleSchema>;
export type AbacConditionGroup = z.infer<typeof ConditionGroupSchema>;

// DTO cho việc tạo mới chính sách (bỏ qua các trường tự sinh)
export type CreatePolicyDto = Omit<AbacPolicy, 'id' | 'created_at' | 'updated_at'>;

// DTO cho việc tạo/cập nhật Attribute (khớp với snake_case của Backend)
export interface AttributeDto {
  attr_key: string;
  attr_type: string; // Gửi lên string để khớp Enum BE
  source_table?: string | null;
  description?: string | null;
  mapping_path?: string | null;
}