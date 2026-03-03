"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, XCircle, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/shared/ui/badge"; 
import { useToast } from "@/shared/lib/hooks/use-toast";

import { getHealthCheck, type HealthCheckResponse, type HealthCheckCategory } from "@/entities/health-check";

interface Props {
  hsmtId: number;
}

export const BiddingHealthCheckWidget = ({ hsmtId }: Props) => {
  const { toast } = useToast();
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHealthCheck = async () => {
      try {
        const res = await getHealthCheck(hsmtId);
        if (res.success && res.data && isMounted) {
          setData(res.data);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải báo cáo năng lực." });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHealthCheck();

    return () => { isMounted = false; };
  }, [hsmtId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="p-10 text-center text-slate-500 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Đang phân tích mức độ đáp ứng năng lực...</p>
        <p className="text-xs mt-2 text-slate-400">Quá trình này có thể mất chút thời gian do gọi hệ thống AI.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 bg-white rounded-lg border border-dashed text-slate-400 text-center">
        <Activity className="h-10 w-10 text-slate-300 mb-2 mx-auto" />
        <p>Hệ thống chưa tạo báo cáo Health Check cho gói thầu này.</p>
      </div>
    );
  }

  // Derived State Extraction (Trích xuất trạng thái phái sinh)
  const allDetails = data.categories.flatMap(c => c.details);
  const totalCriteria = allDetails.length;
  const failedDetails = allDetails.filter(d => d.status !== 'PASS');
  const failedCriteriaCount = failedDetails.length;
  const failedCategoriesCount = data.categories.filter(c => c.status !== 'PASS').length;
  const criticalIssues = failedDetails.slice(0, 3);
  const scorePercent = Math.round(data.score * 10);
  const keyFindings = allDetails.filter(d => d.status === 'PASS' && d.note.trim()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* LEVEL 1: EXECUTIVE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Health Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-800">{scorePercent}</span>
            <span className="text-xl text-slate-400 font-medium">%</span>
          </div>
          <Badge className={`mt-3 border-0 px-4 py-1.5 text-sm ${data.overallStatus === "PASS" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}`}>
            OVERALL: {data.overallStatus}
          </Badge>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm md:col-span-2 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Risk Overview
          </h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-3xl font-bold text-slate-800">{totalCriteria}</p>
              <p className="text-xs text-slate-500 font-medium">Tổng tiêu chí</p>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <p className={`text-3xl font-bold ${failedCriteriaCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{failedCriteriaCount}</p>
              <p className="text-xs text-slate-500 font-medium">Tiêu chí không đạt</p>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div>
              <p className={`text-3xl font-bold ${failedCategoriesCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>{failedCategoriesCount}</p>
              <p className="text-xs text-slate-500 font-medium">Danh mục rủi ro</p>
            </div>
          </div>
          <p className={`text-xs font-semibold mt-4 ${failedCriteriaCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
            {failedCriteriaCount === 0 ? '✓ Sẵn sàng cho quyết định GO' : `⚠ Cần khắc phục ${failedCriteriaCount} tiêu chí trước khi nộp thầu`}
          </p>
        </div>
      </div>

      {/* LEVEL 1.5: CRITICAL ISSUES */}
      {criticalIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-red-800 uppercase flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5" /> Critical Issues (Cần khắc phục ngay)
          </h3>
          <ul className="space-y-3">
            {criticalIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded border border-red-100">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{issue.criteriaName}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">Yêu cầu:</span> {issue.requiredValue} <br/>
                    <span className="font-medium text-red-600">Thực tế:</span> {issue.actualValue}
                  </p>
                  <p className="text-xs text-slate-500 italic mt-1.5">{issue.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* LEVEL 1.5: KEY FINDINGS */}
      {keyFindings.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-green-800 uppercase flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5" /> Key Findings (Điểm mạnh đáp ứng)
          </h3>
          <ul className="space-y-2">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded border border-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{finding.criteriaName}</p>
                  <p className="text-xs text-slate-500 italic mt-0.5">{finding.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* LEVEL 2 & 3: CATEGORY DIAGNOSIS */}
      <div className="bg-white rounded-lg border shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Category Diagnosis
        </h3>
        <div className="space-y-3">
          {data.categories.map((category, idx) => (
            <CategoryAccordion key={idx} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENT (Đóng gói dùng nội bộ trong Widget) ---
const CategoryAccordion = ({ category }: { category: HealthCheckCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalDetails = category.details.length;
  const passedDetails = category.details.filter(d => d.status === 'PASS').length;
  const passPercent = totalDetails === 0 ? 0 : Math.round((passedDetails / totalDetails) * 100);

  return (
    <div className="border rounded-lg overflow-hidden transition-all duration-200">
      <div 
        className="bg-slate-50 hover:bg-slate-100 p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-[200px]">
          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          <span className="font-bold text-slate-800">{category.categoryName}</span>
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${category.status === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${passPercent}%` }}
            ></div>
          </div>
          <div className="w-16 text-right text-xs font-bold text-slate-500">{passedDetails}/{totalDetails}</div>
          <Badge variant="outline" className={`w-20 justify-center border-0 ${category.status === 'PASS' ? 'text-green-700 bg-green-100/50 hover:bg-green-100/50' : 'text-red-700 bg-red-100/50 hover:bg-red-100/50'}`}>
            {category.status}
          </Badge>
        </div>
      </div>

      {isOpen && (
        <div className="border-t bg-white overflow-x-auto p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-1/4">Tiêu chí</th>
                <th className="px-4 py-3 font-medium w-1/4">Yêu cầu</th>
                <th className="px-4 py-3 font-medium w-1/4">Thực tế</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {category.details.map((detail, dIdx) => (
                <tr key={dIdx} className="hover:bg-slate-50/30">
                  <td className="px-4 py-3 text-slate-800 font-medium align-top">{detail.criteriaName}</td>
                  <td className="px-4 py-3 text-slate-600 align-top bg-slate-50/30">{detail.requiredValue}</td>
                  <td className="px-4 py-3 text-slate-600 align-top">{detail.actualValue}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant="secondary" className={`${detail.status === 'PASS' ? 'text-green-700 bg-green-50 hover:bg-green-50' : 'text-red-700 bg-red-50 hover:bg-red-50'} border-0`}>{detail.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};