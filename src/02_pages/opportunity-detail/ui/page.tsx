"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Bot, Activity, FolderOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns"; 

import { Button } from "@/shared/ui/button"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge"; 

// Import từ Entities đã fix lỗi
import { 
  getBiddingPackageDetail, 
  getBiddingPackageFiles, 
  BiddingPackage, 
  BiddingFile 
} from "@/entities/bidding";

interface Props {
  id: string;
}

export const OpportunityDetailPage = ({ id }: Props) => {
  const [data, setData] = useState<BiddingPackage | null>(null);
  const [files, setFiles] = useState<BiddingFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API
        const [detailRes, fileRes] = await Promise.all([
          getBiddingPackageDetail(id),
          getBiddingPackageFiles(id)
        ]);

        if (detailRes.success && detailRes.data) {
          setData(detailRes.data);
        }
        
        if (fileRes.success) {
          setFiles(fileRes.data);
        }
      } catch (error) {
        console.error("Lỗi tải trang chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!data) return <div className="p-6 text-red-500">Không tìm thấy thông tin gói thầu.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="bg-white px-6 py-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Link href="/opportunities" className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách
          </Link>
          <Badge variant="outline" className="bg-slate-100 text-slate-600 font-normal">
            {data.maTbmt}
          </Badge>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
            {data.trangThai || "Dự thảo"}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900 max-w-4xl leading-relaxed">
            {data.tenGoiThau}
          </h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline">Phê duyệt / Quyết định</Button>
            <Button>Khởi tạo Dự án</Button>
          </div>
        </div>
      </div>

      {/* --- TABS & CONTENT --- */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-white border mb-4 w-full justify-start h-auto p-1">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-slate-100 py-2">
              <FileText className="h-4 w-4" /> Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 py-2">
              <Bot className="h-4 w-4" /> Tóm tắt (AI)
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 py-2">
              <Activity className="h-4 w-4" /> Health Check
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2 py-2">
              <FolderOpen className="h-4 w-4" /> Hồ sơ gốc <Badge variant="secondary" className="ml-1 h-5 px-1.5">{files.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: THÔNG TIN CHUNG */}
          <TabsContent value="general" className="space-y-6">
            <SectionCard title="Thông tin cơ bản">
              <InfoRow label="Mã TBMT" value={data.maTbmt} />
              <InfoRow label="Ngày đăng tải" value={formatDate(data.ngayDangTai)} />
              <InfoRow label="Phiên bản thay đổi" value={data.phienBanThayDoi} />
            </SectionCard>

            <SectionCard title="Thông tin chung của KHLCNT">
              <InfoRow label="Mã KHLCNT" value={data.maKhlcnt} isLink />
              <InfoRow label="Phân loại KHLCNT" value={data.phanLoaiKhlcnt} />
              <InfoRow label="Tên dự toán mua sắm" value={data.tenDuAn} />
            </SectionCard>

            <SectionCard title="Thông tin gói thầu">
              <InfoRow label="Quy trình áp dụng" value={data.quyTrinhApDung} fullWidth />
              <InfoRow label="Tên gói thầu" value={data.tenGoiThau} fullWidth />
              <InfoRow label="Chủ đầu tư" value={data.chuDauTu} fullWidth />
              <InfoRow label="Lĩnh vực" value={data.linhVuc} />
              <InfoRow label="Hình thức LCNT" value={data.hinhThucLuaChonNhaThau} />
              <InfoRow label="Thời điểm đóng thầu" value={formatDate(data.thoiDiemDongThau)} />
              <InfoRow label="Số tiền đảm bảo" value={data.soTienDamBaoDuThau} />
              <InfoRow label="Địa điểm thực hiện" value={data.diaDiemThucHienGoiThau} fullWidth />
            </SectionCard>
          </TabsContent>

          {/* TAB 4: HỒ SƠ GỐC */}
          <TabsContent value="files">
             <div className="bg-white rounded-lg border p-4 shadow-sm">
                {files.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic">
                        Không có tài liệu đính kèm nào được tìm thấy.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {files.map((f) => (
                            <li key={f.fileId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-md border border-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{f.fileName}</p>
                                        <p className="text-xs text-slate-500 flex gap-2">
                                            <span>{formatDate(f.uploadDate)}</span>
                                            <span>•</span>
                                            <span className="uppercase">{f.fileType}</span>
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                                    <a href={f.filePath} target="_blank" rel="noreferrer">Tải về</a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
             </div>
          </TabsContent>
          
          <TabsContent value="ai" className="p-4 bg-white rounded border border-dashed text-slate-500 text-center">
            Tính năng AI Analysis đang được phát triển...
          </TabsContent>
          <TabsContent value="health" className="p-4 bg-white rounded border border-dashed text-slate-500 text-center">
             Tính năng Health Check đang được phát triển...
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
    <div className="bg-slate-50/50 px-4 py-3 border-b">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, isLink, fullWidth }: { label: string; value: string | number; isLink?: boolean; fullWidth?: boolean }) => (
  <div className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <span className="text-sm font-medium text-slate-500 min-w-[160px]">{label}</span>
    <span className={`text-sm ${isLink ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-900'} text-right sm:text-left sm:flex-1 break-words`}>
      {value || "--"}
    </span>
  </div>
);

const DetailSkeleton = () => (
    <div className="p-6 space-y-6 bg-slate-50 h-screen">
        <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full max-w-3xl" />
        </div>
        <Skeleton className="h-10 w-96" />
        <div className="space-y-4 pt-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    </div>
);

const formatDate = (dateString?: string) => {
    if (!dateString) return "--";
    try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
        return dateString;
    }
}