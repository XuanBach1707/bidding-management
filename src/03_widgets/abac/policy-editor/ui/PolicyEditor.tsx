import React, { useEffect, useState } from 'react';
import { 
  abacApi, 
  AbacAttribute, 
  AbacPolicy, 
  CreatePolicyDto, 
} from '@/entities/abac';
import { 
  useConditionTree, 
  getOperatorsForType
} from '@/features/abac/policy-design';
import { useToast } from "@/shared/lib/hooks/use-toast";

// ====================================================================
// 1. SUB-COMPONENTS
// ====================================================================

const RuleRowUI = ({ rule, attributes, onUpdate, onRemove }: any) => {
  const selectedAttr = attributes.find((a: AbacAttribute) => a.attr_key === rule.field);
  const attrType = selectedAttr ? selectedAttr.attr_type : "STRING";
  const operators = getOperatorsForType(attrType);

  return (
    <div className="flex gap-2 items-center p-2 bg-white border border-gray-200 rounded mb-2 shadow-sm">
      <select 
        className="border p-1.5 rounded w-1/3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
        value={rule.field}
        onChange={(e) => onUpdate({ field: e.target.value, value: "" })} 
      >
        <option value="">-- Chọn biến --</option>
        {attributes.map((a: AbacAttribute) => (
          <option key={a.id} value={a.attr_key}>
             {a.attr_key} {a.description ? `(${a.description})` : ''}
          </option>
        ))}
      </select>
      
      <select 
        className="border p-1.5 rounded w-[180px] text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value })}
      >
        {operators.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      
      <input 
        className="border p-1.5 rounded flex-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        value={String(rule.value)}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Giá trị..."
      />
      
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 px-2 text-lg">✕</button>
    </div>
  );
};

const GroupUI = ({ group, path, attributes, actions }: any) => {
  return (
    <div 
      className={`p-3 rounded-lg border-l-4 my-2 transition-all ${
        path.length % 2 === 0 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'
      }`}
      style={{ borderLeftColor: group.condition === 'AND' ? '#3b82f6' : '#f59e0b' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <button 
          onClick={() => actions.toggleCondition(path)}
          className={`px-3 py-1 rounded text-xs font-bold text-white shadow-sm ${
            group.condition === 'AND' ? 'bg-blue-500' : 'bg-yellow-500'
          }`}
        >
          {group.condition}
        </button>
        
        <div className="ml-auto flex gap-2">
          <button onClick={() => actions.addRule(path)} className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-50 font-medium">+ Điều kiện</button>
          <button onClick={() => actions.addGroup(path)} className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 font-medium">+ Nhóm con</button>
          {path.length > 0 && ( 
             <button onClick={() => {
                 const parentPath = path.slice(0, -1);
                 const index = path[path.length - 1];
                 actions.removeNode(parentPath, index);
               }} className="text-xs text-red-500 px-3 py-1 hover:bg-red-50 rounded font-medium">Xóa nhóm</button>
          )}
        </div>
      </div>

      <div className="pl-2 border-l border-gray-200 ml-2 space-y-2">
        {group.rules.map((item: any, index: number) => {
          const currentPath = [...path, index];
          if (item.rules) {
            return <GroupUI key={index} group={item} path={currentPath} attributes={attributes} actions={actions} />;
          }
          return <RuleRowUI key={index} rule={item} attributes={attributes} onUpdate={(data: any) => actions.updateRuleData(currentPath, data)} onRemove={() => actions.removeNode(path, index)} />;
        })}
      </div>
    </div>
  );
};

// ====================================================================
// 2. MAIN WIDGET: POLICY EDITOR
// ====================================================================

interface PolicyEditorProps {
  initialPolicy?: AbacPolicy | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ initialPolicy, onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  // State Form
  const [name, setName] = useState(initialPolicy?.name || '');
  const [description, setDescription] = useState(initialPolicy?.description || '');
  const [priority, setPriority] = useState(initialPolicy?.priority || 1);
  const [effect, setEffect] = useState<'ALLOW' | 'DENY'>(initialPolicy?.effect || 'ALLOW');
  const [targetResource, setTargetResource] = useState(initialPolicy?.target_resource || '');
  const [selectedActions, setSelectedActions] = useState<string[]>(initialPolicy?.action || []);
  
  // Dynamic Data Options
  const [attributes, setAttributes] = useState<AbacAttribute[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]); // Đã thay thế PREDEFINED_ACTIONS

  // Logic Tree
  const defaultCondition = initialPolicy?.condition_json || { condition: "AND", rules: [] };
  const { rootCondition, errors: treeErrors, actions } = useConditionTree(defaultCondition);

  // Load Metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [attrs, tables, acts] = await Promise.all([
          abacApi.getAttributes(),
          abacApi.getSystemTables(),
          abacApi.getActions() // API mới
        ]);
        setAttributes(attrs);
        setTableOptions(tables);
        setAvailableActions(acts);
      } catch (error) {
        console.error("Failed to load metadata", error);
        toast({
          variant: "destructive",
          title: "Lỗi tải dữ liệu",
          description: "Không thể lấy danh sách thuộc tính hoặc hành động từ hệ thống."
        });
      }
    };
    fetchMetadata();
  }, []);

  const toggleAction = (act: string) => {
    setSelectedActions(prev => 
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const handleSubmit = async () => {
    const isTreeValid = actions.validate();
    if (!isTreeValid) {
        toast({ variant: "destructive", title: "Lỗi logic", description: "Vui lòng kiểm tra lại các nhóm điều kiện." });
        return;
    }

    if (selectedActions.length === 0) {
        toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng chọn ít nhất 1 hành động (Action)." });
        return;
    }

    const payload: CreatePolicyDto = {
        name,
        description,
        priority: Number(priority),
        effect,
        target_resource: targetResource,
        action: selectedActions,
        condition_json: rootCondition,
        is_active: true
    };

    try {
        if (initialPolicy?.id) {
            await abacApi.updatePolicy(initialPolicy.id, payload);
            toast({ title: "Thành công", description: `Đã cập nhật chính sách "${name}"` });
        } else {
            await abacApi.createPolicy(payload);
            toast({ title: "Thành công", description: "Đã tạo chính sách mới thành công" });
        }
        onSuccess();
    } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Lỗi khi lưu",
          description: error?.response?.data?.message || error.message || "Lỗi hệ thống"
        });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <div>
           <h2 className="text-lg font-bold text-gray-800">
             {initialPolicy ? `Chỉnh sửa: ${initialPolicy.name}` : 'Tạo Chính Sách Mới'}
           </h2>
        </div>
        <div className="flex gap-2">
           <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors">Hủy bỏ</button>
           <button onClick={handleSubmit} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-md transition-all">Lưu chính sách</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* CARD 1: THÔNG TIN CƠ BẢN */}
            <div className="bg-white p-5 rounded-lg border shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">1. Thông tin chung</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên chính sách <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="VD: Cho phép Manager duyệt bài" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mô tả</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20" />
                        </div>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Target Resource <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full border p-2 rounded text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    value={targetResource}
                                    onChange={e => setTargetResource(e.target.value)}
                                >
                                    <option value="">-- Chọn bảng dữ liệu --</option>
                                    {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                             </div>
                             <div className="w-24">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Priority</label>
                                <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full border p-2 rounded text-sm text-center font-bold" />
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Actions (Hành động) <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2 border p-3 rounded bg-gray-50 max-h-32 overflow-y-auto shadow-inner">
                                {availableActions.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">Đang tải danh sách hành động...</span>
                                ) : (
                                    availableActions.map(act => (
                                        <label key={act} className="inline-flex items-center gap-1.5 bg-white border px-2 py-1 rounded cursor-pointer hover:border-blue-400 transition-all shadow-sm">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedActions.includes(act)} 
                                                onChange={() => toggleAction(act)} 
                                                className="rounded text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-[10px] font-bold uppercase text-gray-700">{act}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Effect (Hiệu lực)</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={effect === 'ALLOW'} onChange={() => setEffect('ALLOW')} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                                    <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-100 transition-colors">ALLOW</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" checked={effect === 'DENY'} onChange={() => setEffect('DENY')} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                                    <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full group-hover:bg-red-100 transition-colors">DENY</span>
                                </label>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: LOGIC BUILDER */}
            <div className="bg-white p-5 rounded-lg border shadow-sm min-h-[400px]">
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">2. Thiết lập điều kiện (Logic Rules)</h3>
                    {treeErrors.length > 0 && (
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
                          ⚠️ {treeErrors.length} lỗi logic
                        </span>
                    )}
                 </div>
                 <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <GroupUI 
                        group={rootCondition} 
                        path={[]} 
                        attributes={attributes} 
                        actions={actions} 
                    />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};