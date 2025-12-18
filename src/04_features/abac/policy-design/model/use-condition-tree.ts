import { useState, useCallback } from 'react';
import { AbacConditionGroup, AbacRule } from '@/entities/abac';
import { getOperatorsForType } from './operators';
import { validateConditionNode, ValidationError } from './validation';

// Helper check type
const isGroup = (item: any): item is AbacConditionGroup => item.rules !== undefined;

export const useConditionTree = (initialState: AbacConditionGroup) => {
  const [rootCondition, setRootCondition] = useState<AbacConditionGroup>(initialState);
  
  // State lưu lỗi validation (được định nghĩa trong validation.ts)
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // =================================================================
  // 1. CORE LOGIC: Cập nhật cây đệ quy
  // =================================================================
  const updateNode = useCallback((
    path: number[], 
    updater: (node: AbacConditionGroup | AbacRule) => AbacConditionGroup | AbacRule
  ) => {
    setRootCondition(prev => {
      // Deep clone để tránh mutation bug (Dùng JSON cho đơn giản và tương thích tốt)
      const newRoot = JSON.parse(JSON.stringify(prev));
      
      let current: any = newRoot;
      
      // Duyệt đến node cha của node cần sửa
      // path = [0, 1] -> Duyệt vào rules[0], chuẩn bị sửa rules[1]
      for (let i = 0; i < path.length - 1; i++) {
        if (current.rules) {
            current = current.rules[path[i]];
        }
      }
      
      const lastIndex = path[path.length - 1];
      
      // Trường hợp update Root (path rỗng)
      if (path.length === 0) {
        return updater(newRoot) as AbacConditionGroup;
      }

      // Trường hợp update Node con
      if (current && current.rules) {
          current.rules[lastIndex] = updater(current.rules[lastIndex]);
      }
      
      return newRoot;
    });

    // UX: Mỗi khi user sửa đổi gì đó, ta tạm thời xóa danh sách lỗi cũ
    // để họ không bị rối mắt. Họ sẽ validate lại khi bấm Save.
    setErrors([]);
  }, []);

  // =================================================================
  // 2. CRUD ACTIONS (Thêm/Sửa/Xóa Node)
  // =================================================================
  
  const addRule = (path: number[]) => {
    updateNode(path, (node) => {
      if (isGroup(node)) {
        // Mặc định tạo rule rỗng
        return { ...node, rules: [...node.rules, { field: "", operator: "eq", value: "" }] };
      }
      return node;
    });
  };

  const addGroup = (path: number[]) => {
    updateNode(path, (node) => {
      if (isGroup(node)) {
        // Mặc định tạo Group AND rỗng
        return { ...node, rules: [...node.rules, { condition: "AND", rules: [] }] };
      }
      return node;
    });
  };

  const removeNode = (parentPath: number[], indexToRemove: number) => {
    updateNode(parentPath, (node) => {
      if (isGroup(node)) {
        return { ...node, rules: node.rules.filter((_, i) => i !== indexToRemove) };
      }
      return node;
    });
  };

  const updateRuleData = (path: number[], data: Partial<AbacRule>) => {
    updateNode(path, (node) => ({ ...node, ...data } as AbacRule));
  };
  
  const toggleCondition = (path: number[]) => {
    updateNode(path, (node) => {
       if (isGroup(node)) {
         return { ...node, condition: node.condition === "AND" ? "OR" : "AND" };
       }
       return node;
    });
  };

  // =================================================================
  // 3. BUSINESS ACTIONS (Validate & Logic)
  // =================================================================

  // Action kích hoạt kiểm tra lỗi toàn bộ cây
  const validate = useCallback(() => {
    const foundErrors = validateConditionNode(rootCondition);
    setErrors(foundErrors);
    return foundErrors.length === 0; // Trả về true nếu Hợp lệ (Không có lỗi)
  }, [rootCondition]);

  const clearErrors = () => setErrors([]);

  return {
    rootCondition,
    setRootCondition, // Expose nếu cần reset full state từ bên ngoài
    errors,           // State lỗi để UI hiển thị (nếu có)
    actions: {
      addRule,
      addGroup,
      removeNode,
      updateRuleData,
      toggleCondition,
      validate,              // <--- Mới
      clearErrors,           // <--- Mới
      getAvailableOperators: getOperatorsForType // <--- Mới: Logic lấy operator
    }
  };
};