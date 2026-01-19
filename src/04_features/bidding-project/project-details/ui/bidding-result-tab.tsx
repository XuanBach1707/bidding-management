"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, CheckCircle2, XCircle, Package, CalendarCheck, AlertCircle, User, DollarSign, Award, Info } from "lucide-react";

// Import Entity & Shared
import { biddingResultApi } from "@/entities/bidding-result";
import { formatVND } from "@/shared/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

interface BiddingResultTabProps {
  hsmtId: number;
}

// Helper check giá = 0
const isPriceZero = (price: string | number | null | undefined) => {
    if (!price) return true;
    const val = typeof price === 'string' ? parseFloat(price) : price;
    return val === 0;
};

// --- LOGIC GOM NHÓM (GROUPING) ---
interface GroupedBidder {
    key: string;
    isJointVenture: boolean;
    groupName: string;
    members: {
        id: number;
        name: string;
        code: string;
        taxCode: string;
    }[];
    price?: string | null;
    evaluatedPrice?: string | null;
    reason?: string | null;
    technicalScore?: string | null;
    contractPeriod?: string | null;
    role?: string | null;
}

export const BiddingResultTab = ({ hsmtId }: BiddingResultTabProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bidding-result-full", hsmtId],
    queryFn: () => biddingResultApi.getFull(hsmtId),
    staleTime: 5 * 60 * 1000, 
  });

  // 1. Xử lý gom nhóm WINNERS
  const groupedWinners = useMemo(() => {
    if (!data?.winners) return [];
    
    const groups: Record<string, GroupedBidder> = {};

    data.winners.forEach((w) => {
        const isJV = w.role && w.role.toLowerCase().includes("liên danh");
        const groupKey = isJV ? (w.role as string) : `independent_${w.id}`;

        if (!groups[groupKey]) {
            groups[groupKey] = {
                key: groupKey,
                isJointVenture: !!isJV,
                groupName: isJV ? (w.role as string) : w.bidderName || "N/A",
                members: [],
                price: w.winningPrice,
                evaluatedPrice: w.evaluatedPrice,
                contractPeriod: w.contractPeriod,
                technicalScore: w.technicalScore,
                role: w.role
            };
        }
        
        groups[groupKey].members.push({
            id: w.id,
            name: w.bidderName || "",
            code: w.bidderCode || "",
            taxCode: w.taxCode || ""
        });
    });

    return Object.values(groups);
  }, [data?.winners]);

  // 2. Xử lý gom nhóm FAILED BIDDERS
  const groupedFailed = useMemo(() => {
    if (!data?.failedBidders) return [];
    
    const groups: Record<string, GroupedBidder> = {};

    data.failedBidders.forEach((f) => {
        const jvName = f.jointVentureName;
        const isJV = !!jvName;
        const groupKey = isJV ? jvName : `independent_${f.id}`;

        if (!groups[groupKey]) {
            groups[groupKey] = {
                key: groupKey,
                isJointVenture: isJV,
                groupName: isJV ? jvName : f.bidderName || "N/A",
                members: [],
                reason: f.reason, 
            };
        }

        groups[groupKey].members.push({
            id: f.id,
            name: f.bidderName || "",
            code: f.bidderCode || "",
            taxCode: f.taxCode || ""
        });
    });

    return Object.values(groups);
  }, [data?.failedBidders]);


  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#009d98]" />
            <p className="text-slate-500 font-medium">Đang đồng bộ kết quả từ hệ thống...</p>
        </div>
    );
  }

  if (isError || !data) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
            <AlertCircle className="h-10 w-10 opacity-50" />
            <p>Không thể tải dữ liệu chi tiết kết quả.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 max-w-6xl mx-auto">
      
      {/* 1. INFO PANEL */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
         <div className="bg-slate-50/80 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="p-1.5 bg-[#009d98]/10 rounded text-[#009d98]">
                <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Thông tin Quyết định</h3>
         </div>
         
         <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 md:gap-y-6 gap-x-8">
            <div className="space-y-1">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Số quyết định</div>
                <div className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{data.decisionNumber || "---"}</div>
            </div>
            <div className="space-y-1 lg:col-span-2">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cơ quan ban hành</div>
                <div className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1 break-words" title={data.approvingAgency || ""}>
                    {data.approvingAgency || "---"}
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Ngày phê duyệt</div>
                <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                    {data.approvalDate ? new Date(data.approvalDate).toLocaleDateString('vi-VN') : "---"}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Ngày đăng tải</div>
                <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                    {data.postingDate ? new Date(data.postingDate).toLocaleDateString('vi-VN') : "---"}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Trạng thái KQ</div>
                <div>
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 whitespace-nowrap">
                        {data.resultStatus || "---"}
                      </Badge>
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Giá gói thầu</div>
                <div className="font-extrabold text-[#009d98] text-base font-mono">
                    {formatVND(data.packagePrice)}
                </div>
            </div>
         </div>
      </Card>

      {/* 2. DANH SÁCH NHÀ THẦU */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
         <div className="bg-slate-50/80 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-4 bg-[#009d98] rounded-full"></div>
                Danh sách nhà thầu
            </h3>
            <div className="text-xs font-medium text-slate-500">
                Tổng số: <span className="font-bold text-slate-900">{(data.winners?.length || 0) + (data.failedBidders?.length || 0)}</span>
            </div>
         </div>
         
         {/* 2A. MOBILE LIST VIEW (Cards) - Chỉ hiện trên Mobile */}
         <div className="block md:hidden p-4 space-y-4 bg-slate-50/30">
             {/* Winners Mobile */}
             {groupedWinners.map((group, index) => (
                 <div key={`mob-win-${index}`} className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-2 bg-emerald-100 rounded-bl-xl text-emerald-700">
                         <CheckCircle2 className="w-5 h-5" />
                     </div>
                     
                     <div className="mb-3 pr-8">
                         <h4 className="text-sm font-bold text-slate-900 leading-tight">
                             {group.isJointVenture ? (
                                <span className="text-emerald-700 block text-xs uppercase tracking-wide mb-1">Liên danh trúng thầu</span>
                             ) : null}
                             {group.groupName}
                         </h4>
                     </div>

                     <div className="space-y-2 text-xs text-slate-600 mb-4 pl-3 border-l-2 border-emerald-100">
                         {group.members.map(m => (
                             <div key={m.id}>
                                 <div className="font-medium">{m.name}</div>
                                 <div className="text-[10px] text-slate-400">MST: {m.taxCode}</div>
                             </div>
                         ))}
                     </div>

                     <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                         <div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase">Giá trúng thầu</div>
                             <div className="text-sm font-bold text-emerald-600 font-mono">{formatVND(group.price)}</div>
                         </div>
                         {group.technicalScore && (
                             <div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm kỹ thuật</div>
                                 <div className="text-sm font-medium text-slate-800">{group.technicalScore}</div>
                             </div>
                         )}
                     </div>
                 </div>
             ))}

             {/* Failed Mobile */}
             {groupedFailed.map((group, index) => (
                 <div key={`mob-fail-${index}`} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
                     <div className="absolute top-3 right-3 text-slate-400">
                         <XCircle className="w-5 h-5" />
                     </div>

                     <div className="mb-3 pr-8">
                         <h4 className="text-sm font-medium text-slate-700 leading-tight">
                             {group.isJointVenture ? <span className="block text-[10px] text-slate-400 uppercase mb-1">Liên danh</span> : null}
                             {group.groupName}
                         </h4>
                     </div>

                     {group.reason && (
                         <div className="mt-3 bg-red-50 p-2 rounded border border-red-100 text-xs text-red-700">
                             <span className="font-bold">Lý do:</span> {group.reason}
                         </div>
                     )}
                 </div>
             ))}
         </div>

         {/* 2B. DESKTOP TABLE VIEW - Chỉ hiện trên PC */}
         <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[50px] font-bold text-slate-700 text-center">STT</TableHead>
                    <TableHead className="font-bold text-slate-700">Thông tin nhà thầu / Liên danh</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right min-w-[180px]">Giá & Điểm số</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center w-[140px]">Kết quả</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* WINNERS */}
                    {groupedWinners.map((group, index) => (
                        <TableRow key={`group-win-${index}`} className="bg-emerald-50/40 hover:bg-emerald-50/60 transition-colors">
                            <TableCell className="font-bold text-center text-[#009d98] align-top py-4">{index + 1}</TableCell>
                            <TableCell className="align-top py-4">
                                <div className="font-bold text-slate-900 text-sm mb-2">
                                    {group.isJointVenture ? (
                                        <span className="text-[#009d98] uppercase flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-emerald-100 w-fit pb-0.5">LIÊN DANH TRÚNG THẦU:</span>
                                            {group.groupName}
                                        </span>
                                    ) : group.groupName}
                                </div>
                                <div className="space-y-2 pl-2 border-l-2 border-emerald-200">
                                    {group.members.map(m => (
                                        <div key={m.id} className="text-xs text-slate-700">
                                            <div className="font-semibold">{m.name}</div>
                                            <div className="flex gap-2 text-slate-500 mt-0.5">
                                                <span className="font-mono bg-white px-1 rounded border border-emerald-100">MST: {m.taxCode}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {group.contractPeriod && (
                                    <div className="mt-3 pt-2 border-t border-emerald-100 text-xs flex gap-1">
                                        <span className="font-semibold text-slate-500">Thời gian TH:</span> 
                                        <span className="font-medium text-emerald-800 italic">{group.contractPeriod}</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-top py-4">
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="text-xs text-slate-500 font-semibold uppercase">Giá trúng thầu</div>
                                    <div className="font-bold text-emerald-600 font-mono text-sm">
                                        {formatVND(group.price)}
                                    </div>

                                    {!isPriceZero(group.evaluatedPrice) && (
                                        <>
                                            <div className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Giá đánh giá</div>
                                            <div className="text-xs text-slate-600 font-mono">
                                                {formatVND(group.evaluatedPrice)}
                                            </div>
                                        </>
                                    )}

                                    {group.technicalScore && (
                                        <div className="mt-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                Điểm KT: <span className="text-slate-900">{group.technicalScore}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center align-top py-4">
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 pl-1.5 pr-2.5 h-7">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Trúng thầu
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}

                    {/* FAILED */}
                    {groupedFailed.map((group, index) => (
                        <TableRow key={`group-fail-${index}`} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-400 text-center align-top py-4">
                                {groupedWinners.length + index + 1}
                            </TableCell>
                            <TableCell className="align-top py-4">
                                <div className="font-medium text-slate-700 text-sm mb-2">
                                    {group.isJointVenture ? (
                                        <span className="flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">LIÊN DANH:</span>
                                            <span className="font-bold text-slate-600">{group.groupName}</span>
                                        </span>
                                    ) : group.groupName}
                                </div>
                                <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                                    {group.members.map(m => (
                                        <div key={m.id} className="text-xs text-slate-500">
                                            <div>{m.name}</div>
                                            <div className="font-mono text-[10px] opacity-70">MST: {m.taxCode}</div>
                                        </div>
                                    ))}
                                </div>
                                {group.reason && (
                                    <div className="flex gap-1 mt-3 bg-red-50 p-2 rounded border border-red-100 text-red-700 items-start text-xs">
                                        <span className="font-semibold min-w-[40px] shrink-0">Lý do:</span> 
                                        <span className="italic">{group.reason}</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-middle text-slate-400 font-mono text-sm">---</TableCell>
                            <TableCell className="text-center align-middle">
                                <Badge variant="outline" className="text-slate-500 border-slate-200 gap-1.5 bg-slate-50 h-7">
                                    <XCircle className="w-3.5 h-3.5" /> Trượt thầu
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
         </div>
      </Card>

      {/* 3. DANH SÁCH HÀNG HÓA */}
      {data.items && data.items.length > 0 && (
          <Card className="overflow-hidden border-slate-200 shadow-sm">
             <div className="bg-slate-50/80 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-1.5 bg-slate-200 rounded text-slate-600">
                    <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Chi tiết hàng hóa</h3>
             </div>
             
             {/* Mobile: Stack View */}
             <div className="block md:hidden p-4 space-y-4">
                 {data.items.map((item, idx) => (
                     <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm text-xs">
                         <div className="font-bold text-sm text-slate-800 mb-1 flex gap-2">
                             <span className="text-slate-400">#{idx + 1}</span> {item.itemName}
                         </div>
                         <div className="text-slate-600 mb-2 pl-6 whitespace-pre-line">{item.technicalSpecs || "---"}</div>
                         <div className="grid grid-cols-2 gap-2 pl-6 pt-2 border-t border-slate-50">
                             <div>
                                 <span className="text-[10px] text-slate-400 uppercase font-bold block">Ký mã hiệu</span>
                                 <span>{item.model || "-"}</span>
                             </div>
                             <div>
                                 <span className="text-[10px] text-slate-400 uppercase font-bold block">Xuất xứ</span>
                                 <span>{item.origin || "-"}</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Desktop: Table View */}
             <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                           <TableHead className="w-[50px] text-center">STT</TableHead>
                           <TableHead className="min-w-[250px]">Thông tin hàng hóa</TableHead>
                           <TableHead>Ký mã hiệu / Nhãn hiệu</TableHead>
                           <TableHead>Xuất xứ / Năm SX</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((item, idx) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/50">
                                <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                                <TableCell className="align-top py-3">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Tên hàng hóa:</div>
                                    <div className="font-bold text-slate-800 text-sm mb-2">{item.itemName}</div>
                                    
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Thông số kỹ thuật:</div>
                                    <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line mt-0.5">
                                        {item.technicalSpecs || "---"}
                                    </div>
                                </TableCell>
                                <TableCell className="align-top py-3 space-y-2">
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Mã hiệu:</div>
                                        <div className="text-sm font-medium text-slate-900">{item.model || "---"}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Nhãn hiệu:</div>
                                        <div className="text-sm text-slate-700">{item.brand || "---"}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="align-top py-3 space-y-2">
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Xuất xứ:</div>
                                        <div className="text-sm font-medium text-slate-900">{item.origin || "---"}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold">Năm SX:</div>
                                        <div className="text-sm text-slate-700">{item.yearOfManufacture || "---"}</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             </div>
          </Card>
      )}
    </div>
  );
};