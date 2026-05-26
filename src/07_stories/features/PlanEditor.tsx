import React, { useState } from 'react';
import { PlanNode, EditorAssignee } from '../types/ai-plan-editor';
import { PlanEditorRow } from './PlanEditorRow';
import { Button } from "@/shared/ui/button";
import { Plus } from 'lucide-react';

// Logic update giữ nguyên (nó vẫn cần tìm ID trong mảng lồng nhau)
const updateNodeInTree = (nodes: PlanNode[], id: string, field: string, value: any): PlanNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, [field]: value };
    if (node.children) return { ...node, children: updateNodeInTree(node.children, id, field, value) };
    return node;
  });
};

// Logic xóa
const deleteNodeInTree = (nodes: PlanNode[], id: string): PlanNode[] => {
    return nodes
        .filter(node => node.id !== id) // Xóa nếu là cha
        .map(node => ({
            ...node,
            children: node.children ? deleteNodeInTree(node.children, id) : [] // Đệ quy xóa nếu là con
        }));
};

interface PlanEditorProps {
    initialData: PlanNode[];
    users: EditorAssignee[];
}

export function PlanEditor({ initialData, users }: PlanEditorProps) {
  const [data, setData] = useState<PlanNode[]>(initialData);

  const handleUpdate = (id: string, field: keyof PlanNode, value: any) => {
    setData(prev => updateNodeInTree(prev, id, field, value));
  };

  const handleDelete = (id: string) => {
    setData(prev => deleteNodeInTree(prev, id));
  };

  // 1. Thêm TASK con (Chỉ thêm vào Level 1)
  const handleAddTask = (parentId: string) => {
    setData(prev => prev.map(group => {
        if (group.id === parentId) {
            const childCount = group.children?.length || 0;
            const newChild: PlanNode = {
                id: crypto.randomUUID(),
                code: `${group.code}${childCount + 1}`, // VD: 1.1, 1.2
                name: '',
                assigneeId: null,
                deadline: '',
                confidence: 100,
                children: [] // Con không có con nữa
            };
            return { ...group, children: [...(group.children || []), newChild] };
        }
        return group;
    }));
  };

  // 2. Thêm GROUP cha (Level 0)
  const handleAddGroup = () => {
    const newGroup: PlanNode = {
        id: crypto.randomUUID(),
        code: `${data.length + 1}.`,
        name: '',
        assigneeId: null,
        deadline: '',
        confidence: 100,
        children: []
    };
    setData(prev => [...prev, newGroup]);
  };

  const handleSave = () => {
  };

  return (
    <div className="border rounded-md bg-white shadow-sm flex flex-col h-[700px]">
      {/* Header */}
      <div className="flex items-center gap-2 py-3 border-b bg-gray-50 font-semibold text-sm text-gray-700 shrink-0">
         <div className="flex-1 pl-12">Hạng mục công việc</div>
         <div className="w-[200px]">Người phụ trách</div>
         <div className="w-[110px] pl-2">Deadline</div> 
         <div className="w-[80px] text-right pr-2">Độ tin cậy</div>
         <div className="w-[40px]"></div>
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto">
        {data.map(group => (
            <PlanEditorRow 
                key={group.id} 
                node={group} 
                isGroup={true} // Luôn là Group
                users={users}
                onUpdate={handleUpdate}
                onAddChild={handleAddTask} // Hàm thêm Task
                onDelete={handleDelete}
            />
        ))}

        {/* Nút thêm Group to đùng ở dưới */}
        <div 
            onClick={handleAddGroup}
            className="flex items-center gap-2 py-3 px-4 cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-gray-50 border-b border-dashed border-gray-200 transition-colors pl-12"
        >
             <Plus className="h-4 w-4" />
             <span className="font-medium text-sm">Thêm hạng mục mới</span>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0 rounded-b-md">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Áp dụng Kế hoạch</Button>
      </div>
    </div>
  );
}