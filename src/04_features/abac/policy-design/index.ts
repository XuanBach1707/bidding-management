// 1. Export Hook chính (Cái này quan trọng nhất)
export { useConditionTree } from './model/use-condition-tree';

// 2. Export Types & Logic Validation (Để Widget hiển thị lỗi)
export type { ValidationError } from './model/validation';
export { validateConditionNode } from './model/validation'; 
// (Thường thì dùng qua hook là đủ, nhưng export ra đề phòng cần check thủ công)

// 3. Export Logic Operators (Để Widget render dropdown)
export { getOperatorsForType, OPERATOR_OPTIONS } from './model/operators';