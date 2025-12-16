"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, RefreshCcw, Search, Eye, AlertCircle } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { ScrollArea } from "@/shared/ui/scroll-area"

// --- HELPER: Status Badge Component ---
// Đã chỉnh màu theo yêu cầu: Running (Đen), Success (Xanh), Failed (Đỏ)
const StatusBadge = ({ status }: { status: CrawlerLogStatus }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
          SUCCESS
        </Badge>
      )
    case "FAILED":
      return (
        <Badge variant="destructive">
          FAILED
        </Badge>
      )
    case "RUNNING":
      return (
        <Badge className="bg-black hover:bg-gray-800 text-white border-transparent">
          RUNNING
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Format ngày giờ
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: vi });
  } catch {
    return dateString;
  }
}

// =========================================================
// SUB-COMPONENT: DIALOG CHI TIẾT
// =========================================================
function LogDetailDialog({ 
  logId, 
  open, 
  onOpenChange 
}: { 
  logId: number | null, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) {
  const { data: logDetail, isLoading } = useQuery({
    queryKey: ['crawler-log-detail', logId],
    queryFn: () => getCrawlerLogDetail(logId!),
    enabled: !!logId && open, 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết Nhật ký #{logId}</DialogTitle>
          <DialogDescription>Thông tin chi tiết lượt chạy và cấu hình.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : logDetail ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span className="text-muted-foreground">Trạng thái:</span>
                   <div className="mt-1">
                      <StatusBadge status={logDetail.status} />
                   </div>
                </div>
                <div>
                   <span className="text-muted-foreground">Kết quả:</span>
                   <div className="mt-1 font-semibold text-green-600">{logDetail.packagesFound} gói thầu mới</div>
                </div>
                <div>
                   <span className="text-muted-foreground">Bắt đầu:</span>
                   <div className="mt-1 font-mono">{formatDate(logDetail.startTime)}</div>
                </div>
                <div>
                   <span className="text-muted-foreground">Kết thúc:</span>
                   <div className="mt-1 font-mono">{formatDate(logDetail.endTime)}</div>
                </div>
              </div>

              {logDetail.errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-3 rounded-md text-sm text-red-600 dark:text-red-400 flex gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{logDetail.errorMessage}</span>
                </div>
              )}

              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Search className="w-4 h-4" /> Snapshot Cấu hình
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                   <p><span className="text-muted-foreground">Tên luật:</span> {logDetail.rule.ruleName}</p>
                   <p><span className="text-muted-foreground">Lĩnh vực:</span> {logDetail.rule.businessField}</p>
                   <div className="col-span-full">
                      <span className="text-muted-foreground">Từ khóa:</span> 
                      <span className="ml-2 italic">{logDetail.rule.keywordsInclude.join(", ") || "(Không có)"}</span>
                   </div>
                   <p><span className="text-muted-foreground">Ngân sách:</span> {logDetail.rule.minBudget} - {logDetail.rule.maxBudget}</p>
                   <p><span className="text-muted-foreground">Khu vực:</span> {logDetail.rule.locations.join(", ") || "Toàn quốc"}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground">Không tìm thấy dữ liệu</div>
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Nhật ký hệ thống
                </CardTitle>
                <CardDescription>
                    Theo dõi lịch sử chạy Bot và trạng thái tìm kiếm gói thầu.
                </CardDescription>
            </div>
            
            <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isLoading || isRefetching}
                >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center py-4 gap-2">
          <div className="w-[180px]">
            <Select 
                value={statusFilter} 
                onValueChange={(val) => setStatusFilter(val as CrawlerLogStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="SUCCESS">Thành công</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="RUNNING">Đang chạy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative max-w-sm flex-1">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Tìm theo tên luật..." className="pl-8" disabled />
          </div>
        </div>

        <div className="rounded-md border h-[500px] overflow-hidden flex flex-col relative">
          <div className="overflow-y-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary/90 z-10 backdrop-blur-sm shadow-sm">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[180px]">Thời gian chạy</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead>Luật / Nguồn</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded-full" /></TableCell>
                      <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell />
                    </TableRow>
                   ))
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedLogId(log.id)}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{log.id}</TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col text-xs font-mono text-muted-foreground">
                            <span>BĐ: {formatDate(log.startTime)}</span>
                            <span>KT: {formatDate(log.endTime)}</span>
                        </div>
                      </TableCell>

                      {/* Sử dụng Component Badge mới */}
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>

                      <TableCell className="font-medium text-sm">
                        {log.ruleName || "Unknown Rule"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {log.status === 'FAILED' ? (
                            <span className="text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Lỗi
                            </span>
                        ) : (
                            <span>Tìm thấy <b>{log.packagesFound}</b> gói thầu</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                       Không có nhật ký nào được ghi nhận.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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