// 1. Models & Schemas
// Export Type riêng để tối ưu bundle size
export type { 
    AbacAttribute, 
    AbacPolicy, 
    AbacRule, 
    AbacConditionGroup, 
    CreatePolicyDto,
    AttributeType
} from './model/types';

export { 
    AttributeSchema, 
    PolicySchema, 
    RuleSchema, 
    ConditionGroupSchema,
    AttributeTypeSchema
} from './model/schemas';

// 2. API Services
// Lưu ý: Đảm bảo tên file là abac.service.ts nằm trong thư mục api
export { abacApi } from './api/abac.service';