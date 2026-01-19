"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, RefreshCcw, Search, Eye, AlertCircle, CheckCircle2, Clock, Terminal, Calendar, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { 
  getCrawlerLogs, 
  getCrawlerLogDetail, 
  CrawlerLogStatus, 
} from "@/entities/crawler"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/shared/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Separator } from "@/shared/ui/separator"

// --- HELPER: Status Badge ---
const StatusBadge = ({ status }: { status: CrawlerLogStatus }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold gap-1 pr-3 whitespace-nowrap">
          <CheckCircle2 size={12} /> SUCCESS
        </Badge>
      )
    case "FAILED":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 font-semibold gap-1 pr-3 whitespace-nowrap">
          <AlertCircle size={12} /> FAILED
        </Badge>
      )
    case "RUNNING":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold gap-1 pr-3 whitespace-nowrap">
          <RefreshCcw size={12} className="animate-spin" /> RUNNING
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-slate-500 bg-slate-50">{status}</Badge>
  }
}

// Format ngày giờ
const DateTimeDisplay = ({ dateString }: { dateString: string }) => {
  if (!dateString) return <span className="text-slate-300">-</span>;
  try {
    const date = new Date(dateString);
    return (
      <div className="flex flex-col text-xs font-mono text-slate-500 tabular-nums">
         <span className="font-semibold text-slate-700">{format(date, "HH:mm:ss")}</span>
         <span className="hidden md:inline">{format(date, "dd/MM/yyyy")}</span>
         {/* Mobile: Hiện ngày gọn hơn nếu cần */}
         <span className="md:hidden text-[10px]">{format(date, "dd/MM")}</span>
      </div>
    )
  } catch {
    return <span>{dateString}</span>;
  }
}

// =========================================================
// SUB-COMPONENT: DIALOG CHI TIẾT
// =========================================================
function LogDetailDialog({ 
  logId, open, onOpenChange 
}: { 
  logId: number | null, open: boolean, onOpenChange: (open: boolean) => void 
}) {
  const { data: logDetail, isLoading } = useQuery({
    queryKey: ['crawler-log-detail', logId],
    queryFn: () => getCrawlerLogDetail(logId!),
    enabled: !!logId && open, 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Mobile: w-[95%] max-w-3xl. rounded-xl */}
      <DialogContent className="w-[95%] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 rounded-xl">
        
        {/* HEADER */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-white shrink-0">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg md:text-xl font-bold text-slate-800">
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-[#009d98]" />
                Chi tiết Nhật ký <span className="font-mono text-slate-400 font-normal">#{logId}</span>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
                Xem lại thông số cấu hình và kết quả.
            </DialogDescription>
            </DialogHeader>
        </div>

        {isLoading ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCcw className="w-8 h-8 animate-spin text-[#009d98]" />
            <p>Đang tải dữ liệu chi tiết...</p>
          </div>
        ) : logDetail ? (
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              
              {/* 1. OVERVIEW STATS - Grid 2 cột Mobile / 4 cột PC */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                 <Card className="shadow-sm border-slate-200 bg-white">
                    <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                       <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái</span>
                       <StatusBadge status={logDetail.status} />
                    </CardContent>
                 </Card>
                 <Card className="shadow-sm border-slate-200 bg-white">
                    <CardContent className="p-3 md:p-4 flex flex-col items-center justify-center text-center">
                       <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kết quả</span>
                       <span className="text-lg md:text-xl font-extrabold text-[#009d98] tabular-nums">{logDetail.packagesFound}</span>
                       <span className="text-[10px] text-slate-400">gói thầu</span>
                    </CardContent>
                 </Card>
                 <Card className="col-span-2 shadow-sm border-slate-200 bg-white">
                    <CardContent className="p-3 md:p-4 flex items-center justify-around h-full">
                       <div className="flex flex-col text-center md:text-left">
                          <span className="text-[10px] md:text-xs text-slate-400 flex justify-center md:justify-start items-center gap-1"><Clock size={12} /> Bắt đầu</span>
                          <span className="text-xs md:text-sm font-mono font-medium text-slate-700">{format(new Date(logDetail.startTime), "HH:mm:ss dd/MM")}</span>
                       </div>
                       <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                       <div className="flex flex-col text-center md:text-left">
                          <span className="text-[10px] md:text-xs text-slate-400 flex justify-center md:justify-start items-center gap-1"><CheckCircle2 size={12} /> Kết thúc</span>
                          <span className="text-xs md:text-sm font-mono font-medium text-slate-700">{format(new Date(logDetail.endTime), "HH:mm:ss dd/MM")}</span>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              {/* ERROR MESSAGE (Nếu có) */}
              {logDetail.errorMessage && (
                <div className="bg-red-50 border border-red-200 p-3 md:p-4 rounded-lg flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="font-bold text-red-700 text-sm">Lỗi hệ thống ghi nhận</h4>
                      <p className="text-xs md:text-sm text-red-600 mt-1 font-mono bg-white/50 p-2 rounded border border-red-100 break-words">{logDetail.errorMessage}</p>
                  </div>
                </div>
              )}

              {/* 2. SNAPSHOT CONFIG */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                   <Search className="w-4 h-4 text-slate-500" />
                   <span className="font-bold text-sm text-slate-700">Snapshot Cấu hình</span>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                   {/* Mobile: Grid 1 cột. PC: Grid 2 cột */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Tên luật</label>
                         <p className="font-semibold text-sm md:text-base text-slate-800 break-words">{logDetail.rule.ruleName}</p>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Lĩnh vực</label>
                         <p className="text-sm text-slate-700">{logDetail.rule.businessField}</p>
                      </div>
                   </div>
                   
                   <Separator />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Từ khóa (Include)</label>
                         <div className="flex flex-wrap gap-1.5 mt-1">
                            {logDetail.rule.keywordsInclude.length > 0 ? (
                                logDetail.rule.keywordsInclude.map((k: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] md:text-xs font-medium text-slate-600">{k}</span>
                                ))
                            ) : <span className="text-xs text-slate-400 italic">Không có</span>}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Khu vực</label>
                         <div className="flex flex-wrap gap-1.5 mt-1">
                            {logDetail.rule.locations.length > 0 ? (
                                logDetail.rule.locations.map((k: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] md:text-xs font-medium text-slate-600">{k}</span>
                                ))
                            ) : <span className="text-xs text-slate-400 italic">Toàn quốc</span>}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Ngân sách</label>
                         <p className="text-sm font-mono font-medium text-[#009d98]">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(logDetail.rule.minBudget)} 
                           {" - "} 
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(logDetail.rule.maxBudget)}
                         </p>
                   </div>
                </div>
              </div>

            </div>
          </ScrollArea>
        ) : (
          <div className="h-60 flex items-center justify-center text-slate-400">Không tìm thấy dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// =========================================================
// MAIN COMPONENT: SYSTEM LOGS
// =========================================================
export function SystemLogs() {
  const [statusFilter, setStatusFilter] = useState<CrawlerLogStatus | "ALL">("ALL");
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['crawler-logs', statusFilter],
    queryFn: () => getCrawlerLogs(statusFilter === "ALL" ? {} : { status: statusFilter }),
  });

  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-sm bg-white min-h-[500px]">
      <CardHeader className="pb-0 border-b border-slate-50 bg-slate-50/50 pt-4 md:pt-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Activity className="h-5 w-5 text-[#009d98]" />
                    Nhật ký Hệ thống
                </CardTitle>
                <CardDescription className="mt-1">
                    Lịch sử hoạt động của Bot Crawler.
                </CardDescription>
            </div>
            
            <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                {/* Filters */}
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as CrawlerLogStatus)}>
                    <SelectTrigger className="w-full md:w-[160px] bg-white border-slate-200 h-9">
                        <SelectValue placeholder="Lọc trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả</SelectItem>
                        <SelectItem value="SUCCESS">Thành công</SelectItem>
                        <SelectItem value="FAILED">Thất bại</SelectItem>
                        <SelectItem value="RUNNING">Đang chạy</SelectItem>
                    </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isLoading || isRefetching}
                  className="h-9 border-slate-200 hover:text-[#009d98] hover:border-[#009d98] shrink-0"
                >
                    <RefreshCcw className={`h-4 w-4 md:mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline">Làm mới</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        
        {/* 1. MOBILE CARD LIST - Chỉ hiện trên màn hình nhỏ */}
        <div className="block md:hidden flex-1 overflow-auto bg-slate-50/50">
             {isLoading ? (
                  <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-[#009d98]" /></div>
             ) : logs && logs.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                     {logs.map((log) => (
                        <div 
                          key={log.id} 
                          className="bg-white p-4 active:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedLogId(log.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs text-slate-400">#{log.id}</span>
                                <StatusBadge status={log.status} />
                            </div>
                            
                            <h4 className="font-bold text-sm text-slate-800 mb-1">{log.ruleName || "Unknown Rule"}</h4>
                            
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-slate-500 flex flex-col">
                                   <span>{format(new Date(log.startTime), "HH:mm dd/MM/yyyy")}</span>
                                   {log.endTime && (
                                     <span className="text-[10px] text-slate-400">
                                         {((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000).toFixed(1)}s
                                     </span>
                                   )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {log.status === 'FAILED' ? (
                                        <span className="text-red-500 text-xs font-bold">Error</span>
                                    ) : (
                                        <span className="text-sm font-bold text-[#009d98]">{log.packagesFound} <span className="text-[10px] text-slate-500 font-normal">gói</span></span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </div>
                            </div>
                        </div>
                     ))}
                  </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Terminal className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-sm">Chưa có nhật ký.</span>
                </div>
             )}
        </div>

        {/* 2. DESKTOP TABLE - Hiện trên PC */}
        <div className="hidden md:block flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableHead className="w-[80px] font-bold text-slate-700">ID</TableHead>
                  <TableHead className="w-[120px] font-bold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="w-[180px] font-bold text-slate-700">Thời gian</TableHead>
                  <TableHead className="font-bold text-slate-700">Luật / Cấu hình</TableHead>
                  <TableHead className="font-bold text-slate-700">Kết quả</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-8 bg-slate-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-20 bg-slate-100 animate-pulse rounded-full" /></TableCell>
                      <TableCell><div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-48 bg-slate-100 animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-12 bg-slate-100 animate-pulse rounded" /></TableCell>
                      <TableCell />
                    </TableRow>
                   ))
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow 
                        key={log.id} 
                        className="group hover:bg-slate-50/80 cursor-pointer transition-colors border-slate-100" 
                        onClick={() => setSelectedLogId(log.id)}
                    >
                      <TableCell className="font-mono text-xs text-slate-400 group-hover:text-[#009d98]">#{log.id}</TableCell>
                      
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>

                      <TableCell>
                         <DateTimeDisplay dateString={log.startTime} />
                         {log.status !== 'RUNNING' && log.endTime && (
                             <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Duration: {((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000).toFixed(1)}s
                             </span>
                         )}
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-slate-700 text-sm">{log.ruleName || "Unknown Rule"}</div>
                      </TableCell>

                      <TableCell>
                        {log.status === 'FAILED' ? (
                            <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded inline-flex items-center">
                                Error
                            </span>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-[#009d98] tabular-nums">{log.packagesFound}</span>
                                <span className="text-xs text-slate-500">gói</span>
                            </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 flex flex-col items-center justify-center text-slate-400">
                        <Terminal className="w-10 h-10 mb-2 opacity-20" />
                        <span>Chưa có nhật ký nào được ghi nhận.</span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
      </CardContent>

      <LogDetailDialog 
        open={!!selectedLogId} 
        logId={selectedLogId} 
        onOpenChange={(open) => !open && setSelectedLogId(null)}
      />
    </Card>
  )
}