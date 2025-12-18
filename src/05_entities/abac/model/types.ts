import { z } from 'zod';
import { 
  AttributeSchema, 
  PolicySchema, 
  RuleSchema, 
  ConditionGroupSchema,
  AttributeTypeSchema // Import cái này
} from './schemas';

// Tạo Type từ Schema
export type AttributeType = z.infer<typeof AttributeTypeSchema>; // <--- Fix lỗi import tại đây
export type AbacAttribute = z.infer<typeof AttributeSchema>;
export type AbacPolicy = z.infer<typeof PolicySchema>;
export type AbacRule = z.infer<typeof RuleSchema>;
export type AbacConditionGroup = z.infer<typeof ConditionGroupSchema>;

export type CreatePolicyDto = Omit<AbacPolicy, 'id' | 'created_at' | 'updated_at'>;