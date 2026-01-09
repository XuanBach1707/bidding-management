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
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Save, Plus, Trash2, Shield, AlertTriangle, Layers, Check, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

// ====================================================================
// 0. HELPER: VALIDATE & FORMAT
// ====================================================================

const validateConditionTree = (node: any): boolean => {
  if (node.rules && Array.isArray(node.rules)) {
    if (node.rules.length === 0) return true; 
    return node.rules.every((child: any) => validateConditionTree(child));
  }
  const hasField = !!node.field;
  const hasValue = node.value !== undefined && node.value !== null && String(node.value).trim() !== "";
  return hasField && hasValue;
};

const formatConditionForPayload = (node: any): any => {
  if (node.rules && Array.isArray(node.rules)) {
    return {
      ...node,
      rules: node.rules.map((child: any) => formatConditionForPayload(child))
    };
  }
  const isArrayOperator = ['IN', 'NOT_IN', 'in', 'not_in'].includes(node.operator);
  if (isArrayOperator && typeof node.value === 'string') {
    return {
      ...node,
      value: node.value.split(',').map((v: string) => v.trim()).filter((v: string) => v !== "")
    };
  }
  return node;
};

// ====================================================================
// 1. SUB-COMPONENTS (Classic Nested Style - Refined)
// ====================================================================

const RuleRowUI = ({ rule, attributes, onUpdate, onRemove }: any) => {
  const selectedAttr = attributes.find((a: AbacAttribute) => a.attr_key === rule.field);
  const attrType = selectedAttr ? selectedAttr.attr_type : "STRING";
  const operators = getOperatorsForType(attrType);

  return (
    <div className="flex gap-2 items-center p-2 bg-white border border-slate-200 rounded mb-2 shadow-sm hover:border-[#009d98]/30 transition-colors">
      <select 
        className="border border-slate-300 rounded px-2 h-9 w-1/3 text-sm font-medium focus:ring-1 focus:ring-[#009d98] focus:border-[#009d98] outline-none bg-white"
        value={rule.field}
        onChange={(e) => onUpdate({ field: e.target.value, value: "" })} 
      >
        <option value="">-- Chọn thuộc tính --</option>
        {attributes.map((a: AbacAttribute) => (
          <option key={a.id} value={a.attr_key}>
             {a.attr_key} {a.description ? `(${a.description})` : ''}
          </option>
        ))}
      </select>
      
      <select 
        className="border border-slate-300 rounded px-2 h-9 w-[160px] text-sm bg-slate-50 font-mono text-slate-700 focus:ring-1 focus:ring-[#009d98] focus:border-[#009d98] outline-none"
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value })}
      >
        {operators.map((op: any) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      
      <input 
        className="border border-slate-300 rounded px-3 h-9 flex-1 text-sm focus:ring-1 focus:ring-[#009d98] focus:border-[#009d98] outline-none transition-all placeholder:text-slate-300"
        value={Array.isArray(rule.value) ? rule.value.join(', ') : (rule.value || '')}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder={['IN', 'NOT_IN'].includes(rule.operator) ? "Giá trị 1, Giá trị 2..." : "Nhập giá trị..."}
      />
      
      <button onClick={onRemove} className="text-slate-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition-colors">
         <X size={16} />
      </button>
    </div>
  );
};

const GroupUI = ({ group, path, attributes, actions }: any) => {
  const isRoot = path.length === 0;
  // Giữ nguyên logic màu (Xanh cho AND, Vàng cho OR) nhưng làm dịu hơn
  const borderColor = group.condition === 'AND' ? 'border-l-blue-500' : 'border-l-amber-500';
  const badgeColor = group.condition === 'AND' ? 'bg-blue-600' : 'bg-amber-500';

  return (
    <div 
      className={`p-3 rounded-lg border-l-4 my-2 transition-all ${
        path.length % 2 === 0 ? 'bg-slate-50 border border-slate-200' : 'bg-white border border-slate-100 shadow-sm'
      } ${borderColor}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <button 
          onClick={() => actions.toggleCondition(path)}
          className={`px-3 py-1 rounded text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity ${badgeColor}`}
        >
          {group.condition}
        </button>
        
        <div className="ml-auto flex gap-2">
          <button onClick={() => actions.addRule(path)} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-50 font-medium transition-colors flex items-center gap-1">
             <Plus size={12} /> Điều kiện
          </button>
          <button onClick={() => actions.addGroup(path)} className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 font-medium transition-colors flex items-center gap-1">
             <Layers size={12} /> Nhóm con
          </button>
          {!isRoot && ( 
             <button onClick={() => {
                 const parentPath = path.slice(0, -1);
                 const index = path[path.length - 1];
                 actions.removeNode(parentPath, index);
               }} className="text-xs text-red-500 px-3 py-1 hover:bg-red-50 rounded font-medium transition-colors flex items-center gap-1">
                 <Trash2 size={12} /> Xóa nhóm
             </button>
          )}
        </div>
      </div>

      <div className="pl-3 border-l-2 border-slate-200/50 ml-1 space-y-2">
        {group.rules.length === 0 && (
            <div className="text-xs text-slate-400 italic py-2">Nhóm trống</div>
        )}
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
// 2. MAIN WIDGET: POLICY EDITOR (Layout & Style Updated)
// ====================================================================

interface PolicyEditorProps {
  initialPolicy?: AbacPolicy | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ initialPolicy, onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  const [name, setName] = useState(initialPolicy?.name || '');
  const [description, setDescription] = useState(initialPolicy?.description || '');
  const [priority, setPriority] = useState(initialPolicy?.priority || 1);
  const [effect, setEffect] = useState<'ALLOW' | 'DENY'>(initialPolicy?.effect || 'ALLOW');
  const [targetResource, setTargetResource] = useState(initialPolicy?.target_resource || '');
  const [selectedActions, setSelectedActions] = useState<string[]>(initialPolicy?.action || []);
  
  const [attributes, setAttributes] = useState<AbacAttribute[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const defaultCondition = initialPolicy?.condition_json || { condition: "AND", rules: [] };
  const { rootCondition, errors: treeErrors, actions } = useConditionTree(defaultCondition);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [attrs, tables, acts] = await Promise.all([
          abacApi.getAttributes(),
          abacApi.getSystemTables(),
          abacApi.getActions()
        ]);
        setAttributes(attrs);
        setTableOptions(tables);
        setAvailableActions(acts);
      } catch (error) {
        console.error("Failed to load metadata", error);
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
    if (!name.trim()) return toast({ variant: "destructive", title: "Thiếu tên chính sách" });
    if (!targetResource) return toast({ variant: "destructive", title: "Chưa chọn Resource" });
    if (selectedActions.length === 0) return toast({ variant: "destructive", title: "Chưa chọn Action" });

    if (!actions.validate()) return toast({ variant: "destructive", title: "Lỗi logic", description: "Các nhóm điều kiện không được để trống." });
    if (!validateConditionTree(rootCondition)) return toast({ variant: "destructive", title: "Dữ liệu trống", description: "Vui lòng điền đủ thông tin điều kiện." });

    const payload: CreatePolicyDto = {
        name: name.trim(),
        description: description.trim(),
        priority: Number(priority),
        effect,
        target_resource: targetResource,
        action: selectedActions,
        condition_json: formatConditionForPayload(rootCondition), 
        is_active: true
    };

    const axiosConfig = { headers: { 'x-no-transform': 'true' } };

    try {
        if (initialPolicy?.id) {
            await abacApi.updatePolicy(initialPolicy.id, payload, axiosConfig);
            toast({ title: "Cập nhật thành công", className: "bg-[#009d98] text-white border-none" });
        } else {
            await abacApi.createPolicy(payload, axiosConfig);
            toast({ title: "Tạo mới thành công", className: "bg-[#009d98] text-white border-none" });
        }
        onSuccess();
    } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Lỗi khi lưu",
          description: error?.response?.data?.message || "Lỗi hệ thống"
        });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-[#009d98]/10 rounded-lg">
              <Shield className="w-5 h-5 text-[#009d98]" />
           </div>
           <h2 className="text-lg font-extrabold text-slate-800">
             {initialPolicy ? `Chỉnh sửa: ${initialPolicy.name}` : 'Tạo Chính Sách Mới'}
           </h2>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={onCancel} className="text-slate-600">Hủy bỏ</Button>
           <Button onClick={handleSubmit} className="bg-[#009d98] hover:bg-[#008580] text-white font-bold shadow-sm">
              <Save size={16} className="mr-2" /> Lưu chính sách
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pb-20">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* SECTION 1: INFO */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-5 border-b border-slate-100 pb-2 tracking-wide">1. Thông tin chung</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tên chính sách <span className="text-red-500">*</span></label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="bg-white font-semibold" placeholder="VD: Quản lý xem báo cáo" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Mô tả</label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-white h-24" placeholder="Mô tả mục đích..." />
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-5">
                        <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Resource <span className="text-red-500">*</span></label>
                                <Select value={targetResource} onValueChange={setTargetResource}>
                                    <SelectTrigger className="bg-white font-mono"><SelectValue placeholder="Chọn bảng" /></SelectTrigger>
                                    <SelectContent>
                                        {tableOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="w-24">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Priority</label>
                                <Input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} className="bg-white text-center font-bold" />
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Actions <span className="text-red-500">*</span></label>
                            <div className="flex flex-wrap gap-2 border p-3 rounded-lg bg-slate-50/50">
                                {availableActions.map(act => (
                                    <Badge 
                                        key={act} 
                                        variant={selectedActions.includes(act) ? "default" : "outline"}
                                        onClick={() => toggleAction(act)}
                                        className={`cursor-pointer select-none ${selectedActions.includes(act) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                                    >
                                        {act}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Effect</label>
                             <div className="flex gap-3">
                                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${effect === 'ALLOW' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    <input type="radio" className="hidden" checked={effect === 'ALLOW'} onChange={() => setEffect('ALLOW')} />
                                    <Check size={16} /> ALLOW
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${effect === 'DENY' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    <input type="radio" className="hidden" checked={effect === 'DENY'} onChange={() => setEffect('DENY')} />
                                    <X size={16} /> DENY
                                </label>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: LOGIC BUILDER */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">2. Thiết lập điều kiện</h3>
                    {(treeErrors.length > 0) && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                           <AlertTriangle size={14} /> Có lỗi logic trong điều kiện
                        </div>
                    )}
                 </div>
                 
                 <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
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