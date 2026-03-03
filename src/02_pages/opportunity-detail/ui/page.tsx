"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Bot, Activity, FolderOpen, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { format } from "date-fns"; 

// Shared UI Components
import { Button } from "@/shared/ui/button"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; 
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge"; 
import { useToast } from "@/shared/lib/hooks/use-toast";

// Feature Auth Context
import { useAuth } from "@/features/auth/model/auth-context";

// Features & Widgets
import { CreateProjectModal } from "@/features/bidding-project/create-project";
import { BiddingAiSummary } from "@/features/bid";
import { BiddingHealthCheckWidget } from "@/widgets/bidding-health-check"; 

// Entities
import { 
  getBiddingPackageDetail, 
  getBiddingPackageFiles, 
  updateBiddingDecision,
  submitBiddingReview,
  type BiddingPackage, 
  type BiddingFile
} from "@/entities/bidding";

interface Props {
  id: string;
}

export const OpportunityDetailPage = ({ id }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  // State Management
  const [data, setData] = useState<BiddingPackage | null>(null);
  const [files, setFiles] = useState<BiddingFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Modal State cho Confirmations
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    actionType: "GO" | "NO_GO" | "SUBMIT" | null;
  }>({ isOpen: false, actionType: null });
  const [actionReason, setActionReason] = useState("");

  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set(["general"]));

  const fetchInitialData = async () => {
    try {
      const [detailRes, fileRes] = await Promise.all([
        getBiddingPackageDetail(Number(id)), 
        getBiddingPackageFiles(Number(id))
      ]);
      if (detailRes.success && detailRes.data) setData(detailRes.data);
      if (fileRes.success) setFiles(fileRes.data);
    } catch (error) {
      console.error("[Page] Lỗi tải trang chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTabChange = (value: string) => {
    setRenderedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.add(value);
      return newSet;
    });
  };

  // --- Modal Controllers ---
  const openConfirmModal = (type: "GO" | "NO_GO" | "SUBMIT") => {
    setModalConfig({ isOpen: true, actionType: type });
    setActionReason("");
  };

  const closeConfirmModal = () => {
    setModalConfig({ isOpen: false, actionType: null });
    setActionReason("");
  };

  // --- Core Logic Thực thi API ---
  const executeAction = async () => {
    const { actionType } = modalConfig;
    if (!actionType) return;

    // Validate Input cho các hành động cần lý do
    if ((actionType === "GO" || actionType === "NO_GO") && !actionReason.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Thiếu thông tin", 
        description: "Vui lòng nhập lý do để tiếp tục." 
      });
      return;
    }

    setIsSubmitting(true);
    closeConfirmModal();

    try {
      let res;
      if (actionType === "SUBMIT") {
        res = await submitBiddingReview(Number(id));
      } else {
        res = await updateBiddingDecision(Number(id), actionType, actionReason);
      }

      if (res.success) {
        toast({ 
          title: "Thành công", 
          description: actionType === "SUBMIT" ? "Đã trình duyệt gói thầu thành công." : `Đã lưu quyết định: ${actionType}` 
        });
        
        // Điều hướng sau khi Submit thành công
        if (actionType === "SUBMIT") {
          setTimeout(() => {
            router.push("/opportunities");
          }, 1000);
        } else {
          await fetchInitialData(); 
        }
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi thực thi", 
        description: error.message || "Không thể kết nối đến máy chủ." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!data) return <div className="p-10 text-center text-red-500 font-medium">Không tìm thấy thông tin gói thầu.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen relative">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white px-4 md:px-6 py-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="mb-3 md:mb-2 flex flex-wrap items-center gap-2">
          <Link href="/opportunities" className="flex items-center text-sm text-slate-500 hover:text-primary transition-colors shrink-0">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span className="hidden md:inline">Quay lại danh sách</span>
            <span className="md:hidden">Quay lại</span>
          </Link>
          
          <Badge variant="outline" className="bg-slate-100 text-slate-600 font-normal">
            {data.maTbmt || "--"}
          </Badge>
          
          <Badge className={`${
            data.trangThai === 'BIDDING' ? 'bg-blue-100 text-blue-700' : 
            data.trangThai === 'NO_GO' ? 'bg-red-100 text-red-700' :
            data.trangThai === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          } border-0`}>
            {data.trangThai || "MỚI"}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 max-w-4xl leading-snug">
            {data.tenGoiThau}
          </h1>

          <div className="flex flex-wrap gap-2 shrink-0 items-center">
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin text-slate-400 mr-2" />}
            
            {/* Hardcheck BID_MANAGER role cho nút trình duyệt */}
            {user?.role === "BID_MANAGER" && (data.trangThai === "NEW" || data.trangThai === "INTERESTED") && (
              <Button 
                variant="default" 
                disabled={isSubmitting}
                onClick={() => openConfirmModal("SUBMIT")}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
              >
                <Send className="h-4 w-4" /> Trình duyệt
              </Button>
            )}

            {(data.trangThai !== "BIDDING" && data.trangThai !== "NO_GO") && (
              <>
                {data.allowedActions?.includes("REJECT_BID") && (
                  <Button 
                    variant="outline" 
                    onClick={() => openConfirmModal("NO_GO")}
                    className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="h-4 w-4" /> NO GO
                  </Button>
                )}

                {data.allowedActions?.includes("APPROVE_BID") && (
                  <Button 
                    variant="outline" 
                    onClick={() => openConfirmModal("GO")}
                    className="border-green-200 text-green-600 hover:bg-green-50 gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Duyệt (GO)
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="general" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="bg-white border mb-4 w-full justify-start h-auto p-1 overflow-x-auto no-scrollbar">
            <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-slate-100 py-2 shrink-0">
              <FileText className="h-4 w-4" /> Thông tin
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 py-2 shrink-0">
              <Bot className="h-4 w-4" /> Tóm tắt (AI)
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 py-2 shrink-0">
              <Activity className="h-4 w-4" /> Health Check
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2 py-2 shrink-0">
              <FolderOpen className="h-4 w-4" /> Hồ sơ gốc <Badge variant="secondary" className="ml-1 h-5 px-1.5">{files.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <SectionCard title="Thông tin cơ bản">
              <InfoRow label="Mã TBMT" value={data.maTbmt} />
              <InfoRow label="Ngày đăng tải" value={formatDate(data.ngayDangTai)} />
              <InfoRow label="Phiên bản thay đổi" value={data.phienBanThayDoi} />
              <InfoRow label="Trạng thái" value={data.trangThai} />
              <InfoRow label="Link gốc" value={data.duongDanGoiThau} isLink /> 
            </SectionCard>

            <SectionCard title="Thông tin KHLCNT & Dự án">
              <InfoRow label="Mã KHLCNT" value={data.maKhlcnt} isLink />
              <InfoRow label="Phân loại KHLCNT" value={data.phanLoaiKhlcnt} />
              <InfoRow label="Tên dự toán/Dự án" value={data.tenDuAn} fullWidth />
              <InfoRow label="Chi tiết nguồn vốn" value={data.chiTietNguonVon} fullWidth />
            </SectionCard>
            {/* ... [Các SectionCard khác giữ nguyên] ... */}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
             <BiddingAiSummary hsmtId={data.hsmtId} />
          </TabsContent>

          <TabsContent value="health">
             {renderedTabs.has("health") && (
               <BiddingHealthCheckWidget hsmtId={data.hsmtId} />
             )}
          </TabsContent>

          <TabsContent value="files">
             <div className="bg-white rounded-lg border p-4 shadow-sm">
                {files.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic">Không có tài liệu nào.</div>
                ) : (
                  <ul className="space-y-2">
                    {files.map((f) => (
                      <li key={f.fileId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-md border border-slate-100 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate pr-2">{f.fileName}</p>
                            <p className="text-xs text-slate-500 uppercase truncate">{f.fileType} • {formatDate(f.uploadDate)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 shrink-0" asChild>
                          <a href={f.filePath} target="_blank" rel="noreferrer">Tải về</a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Overlay */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Xác nhận {modalConfig.actionType === "SUBMIT" ? "trình duyệt" : modalConfig.actionType === "GO" ? "phê duyệt (GO)" : "bỏ qua (NO GO)"}
            </h3>
            
            <p className="text-slate-600 text-sm mb-4">
              {modalConfig.actionType === "SUBMIT" 
                ? "Gói thầu sẽ được chuyển sang trạng thái Chờ duyệt bởi lãnh đạo." 
                : "Vui lòng nhập lý do để lưu lại lịch sử phê duyệt."}
            </p>

            {modalConfig.actionType !== "SUBMIT" && (
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-md text-sm mb-4"
                rows={3}
                placeholder="Nhập lý do..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                autoFocus
              />
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={closeConfirmModal}>Hủy</Button>
              <Button onClick={executeAction} className="bg-blue-600 hover:bg-blue-700">Xác nhận</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KHỞI TẠO DỰ ÁN */}
      {data && (
        <CreateProjectModal 
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          hsmtId={data.hsmtId} 
          defaultName={data.tenGoiThau}
        />
      )}
    </div>
  );
};

// Sub-components & Helpers giữ nguyên
const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
    <div className="bg-slate-50/50 px-4 py-3 border-b">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, isLink, fullWidth }: any) => (
  <div className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <span className="text-sm font-medium text-slate-500 sm:min-w-[160px]">{label}</span>
    <span className={`text-sm ${isLink ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-900'} sm:flex-1 break-words`}>
      {value ?? "--"} 
    </span>
  </div>
);

const DetailSkeleton = () => (
  <div className="p-6 space-y-6 bg-slate-50 h-screen">
    <div className="space-y-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-8 w-full max-w-3xl" /></div>
    <Skeleton className="h-10 w-96" />
    <div className="space-y-4 pt-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
  </div>
);

const formatDate = (dateString?: string | null) => { 
  if (!dateString) return "--";
  try { return format(new Date(dateString), "dd/MM/yyyy HH:mm"); } catch { return dateString; }
}