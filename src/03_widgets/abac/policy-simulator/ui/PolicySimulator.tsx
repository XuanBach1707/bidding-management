import React, { useState, useEffect } from 'react';
import { abacApi, AbacAttribute, AbacPolicy } from '@/entities/abac';

// Hàm so sánh toán tử logic (Engine thu nhỏ)
const checkRule = (rule: any, ctx: any): boolean => {
  const { field, operator, value } = rule;
  // Lấy giá trị thực tế từ context (Ví dụ: ctx['user.role'])
  // Hỗ trợ lây nested key nếu cần, ở đây giả sử flat key hoặc khớp string
  const actualValue = ctx[field];

  if (actualValue === undefined) return false; // Không có dữ liệu -> Fail

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
       // Value trong Rule có thể là string "A,B,C" hoặc array
       if (Array.isArray(value)) return value.some((v: any) => String(v).toLowerCase() === sActual);
       return String(value).toLowerCase().includes(sActual);
    default: return false;
  }
};

// Hàm đệ quy duyệt cây điều kiện
const evaluateCondition = (node: any, context: any): boolean => {
  // 1. Nếu là Group (có rules)
  if (node.rules && Array.isArray(node.rules)) {
    if (node.condition === 'AND') {
      return node.rules.every((child: any) => evaluateCondition(child, context));
    } else { // OR
      return node.rules.some((child: any) => evaluateCondition(child, context));
    }
  }
  // 2. Nếu là Rule đơn lẻ
  return checkRule(node, context);
};

export const PolicySimulator: React.FC = () => {
  const [policies, setPolicies] = useState<AbacPolicy[]>([]);
  const [attributes, setAttributes] = useState<AbacAttribute[]>([]);
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

  // Load Data thật từ Server
  useEffect(() => {
    abacApi.getPolicies().then(setPolicies).catch(console.error);
    abacApi.getAttributes().then(setAttributes).catch(console.error);
    abacApi.getSystemTables().then(setTableOptions).catch(console.error);
  }, []);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setResult(null);
      setTrace('');

      // 1. Parse Input
      const subjectCtx = JSON.parse(subjectJson);
      const resourceCtx = JSON.parse(resourceJson);
      
      // Gộp lại thành 1 cục Context duy nhất để dễ tra cứu
      // Ví dụ: { "user.role": "STAFF", "resource.amount": 5000 }
      const fullContext = { ...subjectCtx, ...resourceCtx };

      await new Promise(r => setTimeout(r, 500)); // Delay tí cho có cảm giác đang tính

      // 2. LOGIC MATCHING (Mô phỏng BE)
      // Bước A: Lọc các Policy có Resource và Action phù hợp
      const matchedPolicies = policies.filter(p => {
         // Check Resource (Nếu policy ko set resource thì coi như match all hoặc tuỳ logic)
         if (p.target_resource && p.target_resource !== targetTable) return false;
         
         // Check Action (Array check)
         if (!p.action.includes(action)) return false;
         
         return true;
      });

      // Bước B: Sắp xếp theo Priority giảm dần (Số to check trước)
      matchedPolicies.sort((a, b) => b.priority - a.priority);

      let finalEffect = 'DENY'; // Mặc định là chặn
      let decidingPolicy = null;

      // Bước C: Duyệt từng Policy
      for (const policy of matchedPolicies) {
         // Check Logic Tree
         const isMatch = evaluateCondition(policy.condition_json, fullContext);
         
         if (isMatch) {
            finalEffect = policy.effect;
            decidingPolicy = policy;
            break; // Tìm thấy luật khớp ưu tiên cao nhất -> Dừng ngay
         }
      }

      // 3. Kết quả
      if (decidingPolicy) {
        setResult(finalEffect as any);
        setTrace(`Quyết định bởi Policy ID #${decidingPolicy.id}: "${decidingPolicy.name}" (Priority: ${decidingPolicy.priority})`);
      } else {
        setResult('DENY');
        setTrace('Bị từ chối: Không tìm thấy Policy nào khớp (Default Deny).');
      }

    } catch (error: any) {
      alert("Lỗi cú pháp JSON input: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Mô phỏng Phân quyền (Real-time)</h2>
      <p className="text-xs text-gray-500 mb-6">Hệ thống sẽ tải toàn bộ Policy hiện có và kiểm tra logic ngay tại đây.</p>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* CỘT TRÁI: INPUT */}
        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
          
          {/* Chọn Bảng & Hành động trước để lọc nhanh */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Resource Table</label>
                <select 
                    className="w-full p-2 border rounded text-sm bg-gray-50"
                    value={targetTable}
                    onChange={e => setTargetTable(e.target.value)}
                >
                    <option value="">-- Chọn bảng --</option>
                    {tableOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Action</label>
                <select 
                    className="w-full p-2 border rounded text-sm bg-gray-50 font-bold"
                    value={action}
                    onChange={e => setAction(e.target.value)}
                >
                    {["VIEW", "create", "update", "delete", "APPROVE", "ASSIGN"].map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">1. User Context (Subject)</label>
            <textarea 
              className="w-full h-32 p-3 text-xs font-mono border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={subjectJson}
              onChange={e => setSubjectJson(e.target.value)}
              spellCheck={false}
            />
            <p className="text-[10px] text-gray-400 mt-1">Key phải khớp với Attribute Key đã khai báo (VD: user.role)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">2. Resource Context (Attributes)</label>
            <textarea 
              className="w-full h-32 p-3 text-xs font-mono border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={resourceJson}
              onChange={e => setResourceJson(e.target.value)}
              spellCheck={false}
            />
          </div>

          <button 
            onClick={handleSimulate}
            disabled={loading}
            className={`w-full py-3 rounded font-bold text-white shadow transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Đang tính toán...' : 'CHẠY GIẢ LẬP (SIMULATE)'}
          </button>
        </div>

        {/* CỘT PHẢI: KẾT QUẢ */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center relative">
          
          {!result && !loading && (
             <div className="text-center text-gray-400">
                <div className="text-4xl mb-2"></div>
                <p className="text-sm">Nhập thông tin và bấm Chạy giả lập</p>
             </div>
          )}

          {result === 'ALLOW' && (
             <div className="text-center animate-bounce-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-3xl font-black text-green-600 mb-2">ALLOW</h3>
                <p className="text-green-800 font-medium">Chấp nhận truy cập</p>
             </div>
          )}

          {result === 'DENY' && (
             <div className="text-center animate-shake">
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 className="text-3xl font-black text-red-600 mb-2">DENY</h3>
                <p className="text-red-800 font-medium">Từ chối truy cập</p>
             </div>
          )}

          {/* Trace Log */}
          {trace && (
             <div className="mt-8 p-4 bg-white border-l-4 border-indigo-500 rounded shadow-sm text-sm text-gray-700 w-full text-left">
                <span className="font-bold block mb-1 uppercase text-xs text-gray-400">Trace Log:</span>
                {trace}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};