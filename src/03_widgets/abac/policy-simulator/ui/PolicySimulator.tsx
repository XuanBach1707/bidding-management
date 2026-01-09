import React, { useState, useEffect } from 'react';
import { abacApi, AbacAttribute, AbacPolicy } from '@/entities/abac';
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Play, CheckCircle, XCircle, RotateCcw, ShieldCheck, Bug } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

// --- LOGIC ENGINE (Giữ nguyên) ---
const checkRule = (rule: any, ctx: any): boolean => {
  const { field, operator, value } = rule;
  const actualValue = ctx[field];
  if (actualValue === undefined) return false;

  const sActual = String(actualValue).toLowerCase();
  const sValue = String(value).toLowerCase();

  switch (operator) {
    case 'eq': return sActual === sValue;
    case 'neq': return sActual !== sValue;
    case 'gt': return Number(actualValue) > Number(value);
    case 'lt': return Number(actualValue) < Number(value);
    case 'gte': return Number(actualValue) >= Number(value);
    case 'lte': return Number(actualValue) <= Number(value);
    case 'contains': return sActual.includes(sValue);
    case 'in': 
       if (Array.isArray(value)) return value.some((v: any) => String(v).toLowerCase() === sActual);
       return String(value).toLowerCase().includes(sActual);
    default: return false;
  }
};

const evaluateCondition = (node: any, context: any): boolean => {
  if (node.rules && Array.isArray(node.rules)) {
    if (node.condition === 'AND') {
      return node.rules.every((child: any) => evaluateCondition(child, context));
    } else {
      return node.rules.some((child: any) => evaluateCondition(child, context));
    }
  }
  return checkRule(node, context);
};

export const PolicySimulator: React.FC = () => {
  const [policies, setPolicies] = useState<AbacPolicy[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);

  // Input State
  const [subjectJson, setSubjectJson] = useState<string>('{\n  "user.role": "STAFF",\n  "user.department": "SALES"\n}');
  const [resourceJson, setResourceJson] = useState<string>('{\n  "resource.owner": "SALES",\n  "resource.amount": 5000\n}');
  const [targetTable, setTargetTable] = useState<string>('');
  const [action, setAction] = useState<string>('VIEW');

  // Result State
  const [result, setResult] = useState<'ALLOW' | 'DENY' | null>(null);
  const [trace, setTrace] = useState<string>(''); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    abacApi.getPolicies().then(setPolicies).catch(console.error);
    abacApi.getSystemTables().then(setTableOptions).catch(console.error);
  }, []);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setResult(null);
      setTrace('');

      const subjectCtx = JSON.parse(subjectJson);
      const resourceCtx = JSON.parse(resourceJson);
      const fullContext = { ...subjectCtx, ...resourceCtx };

      await new Promise(r => setTimeout(r, 600)); 

      // 1. Filter Policies
      const matchedPolicies = policies.filter(p => {
         if (p.target_resource && p.target_resource !== targetTable) return false;
         if (!p.action.includes(action)) return false;
         return true;
      });

      // 2. Sort Priority
      matchedPolicies.sort((a, b) => b.priority - a.priority);

      let finalEffect = 'DENY';
      let decidingPolicy = null;

      // 3. Evaluate
      for (const policy of matchedPolicies) {
         const isMatch = evaluateCondition(policy.condition_json, fullContext);
         if (isMatch) {
            finalEffect = policy.effect;
            decidingPolicy = policy;
            break;
         }
      }

      if (decidingPolicy) {
        setResult(finalEffect as any);
        setTrace(`Quyết định bởi Policy: [${decidingPolicy.name}] (Priority: ${decidingPolicy.priority})`);
      } else {
        setResult('DENY');
        setTrace('Bị từ chối: Không tìm thấy Policy nào khớp (Default Deny).');
      }

    } catch (error: any) {
      setTrace("Lỗi cú pháp JSON: " + error.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulator = () => {
      setResult(null);
      setTrace('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#009d98]/10 rounded-xl">
               <Bug className="w-6 h-6 text-[#009d98]" />
            </div>
            <div>
               <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">ABAC Simulator</h2>
               <p className="text-sm text-slate-500 font-medium">Kiểm tra và gỡ lỗi quyền truy cập thời gian thực.</p>
            </div>
         </div>
         <Button variant="outline" onClick={resetSimulator} className="gap-2 text-slate-600">
            <RotateCcw className="w-4 h-4" /> Đặt lại
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6 overflow-y-auto">
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase">Target Resource</Label>
                 <Select value={targetTable} onValueChange={setTargetTable}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 font-mono text-sm">
                        <SelectValue placeholder="Chọn bảng..." />
                    </SelectTrigger>
                    <SelectContent>
                        {tableOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase">Action</Label>
                 <Select value={action} onValueChange={setAction}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 font-bold text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["VIEW", "create", "update", "delete", "APPROVE", "ASSIGN"].map(a => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
              </div>
           </div>

           <div className="space-y-2 flex-1">
              <Label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                  <span>Subject Context (User)</span>
                  <span className="text-[10px] normal-case text-slate-400 font-normal">JSON Format</span>
              </Label>
              <textarea 
                className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-lg bg-slate-900 text-green-400 focus:ring-2 focus:ring-[#009d98] outline-none resize-none leading-relaxed"
                value={subjectJson}
                onChange={e => setSubjectJson(e.target.value)}
                spellCheck={false}
              />
           </div>

           <div className="space-y-2 flex-1">
              <Label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                  <span>Resource Context (Data)</span>
                  <span className="text-[10px] normal-case text-slate-400 font-normal">JSON Format</span>
              </Label>
              <textarea 
                className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-lg bg-slate-900 text-blue-400 focus:ring-2 focus:ring-[#009d98] outline-none resize-none leading-relaxed"
                value={resourceJson}
                onChange={e => setResourceJson(e.target.value)}
                spellCheck={false}
              />
           </div>

           <Button 
             onClick={handleSimulate} 
             disabled={loading || !targetTable}
             className="w-full bg-[#009d98] hover:bg-[#008580] text-white font-bold h-12 shadow-md text-base"
           >
             {loading ? "Đang phân tích..." : <><Play className="w-5 h-5 mr-2 fill-current" /> Chạy Giả Lập</>}
           </Button>
        </div>

        {/* RIGHT COLUMN: RESULT */}
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{ backgroundImage: 'radial-gradient(#009d98 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {!result && !loading && (
                    <div className="text-center text-slate-400 z-10">
                        <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">Sẵn sàng kiểm tra.</p>
                        <p className="text-xs mt-1">Nhập thông tin bên trái và nhấn Chạy giả lập.</p>
                    </div>
                )}

                {/* ALLOW RESULT */}
                {result === 'ALLOW' && (
                    <div className="text-center z-10 animate-in zoom-in duration-300">
                        <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100 shadow-xl">
                            <CheckCircle className="w-16 h-16" />
                        </div>
                        <Badge className="bg-emerald-600 text-white text-lg px-6 py-1.5 mb-3 hover:bg-emerald-700 border-none shadow-md">
                            ALLOW
                        </Badge>
                        <p className="text-slate-600 font-medium">Yêu cầu được chấp thuận</p>
                    </div>
                )}

                {/* DENY RESULT */}
                {result === 'DENY' && (
                    <div className="text-center z-10 animate-in zoom-in duration-300">
                        <div className="w-28 h-28 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100 shadow-xl">
                            <XCircle className="w-16 h-16" />
                        </div>
                        <Badge className="bg-red-600 text-white text-lg px-6 py-1.5 mb-3 hover:bg-red-700 border-none shadow-md">
                            DENY
                        </Badge>
                        <p className="text-slate-600 font-medium">Yêu cầu bị từ chối</p>
                    </div>
                )}
            </div>

            {/* TRACE LOG */}
            <div className="h-32 bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-y-auto shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                    <span className="w-2 h-2 rounded-full bg-[#009d98] animate-pulse"></span>
                    System Trace Log
                </div>
                <div className="font-mono text-xs space-y-1">
                    {loading && <p className="text-yellow-500">Processing request...</p>}
                    {!loading && !result && <p className="text-slate-600 italic">Waiting for input...</p>}
                    {result && (
                        <>
                            <p className="text-slate-400"> Analyzing policies for resource: <span className="text-white">{targetTable}</span></p>
                            <p className="text-slate-400"> Context evaluation completed.</p>
                            <p className={result === 'ALLOW' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                {trace}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};