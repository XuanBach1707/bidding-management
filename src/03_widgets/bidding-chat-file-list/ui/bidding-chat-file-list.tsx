"use client";

import { useEffect, useState, useRef } from 'react';
import { 
  FileText, Calendar, Layers, CheckCircle2, Clock, 
  AlertCircle, Upload, Loader2, RefreshCw, Database, Trash2
} from 'lucide-react';

import { useBiddingChat } from '@/features/bidding-lookup-chat';
import { 
  aiBiddingApi, 
  AiDocumentItem, 
  LEGAL_LEVELS, 
} from '@/entities/ai-bidding';
import { useToast } from '@/shared/lib/hooks/use-toast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui/select";
import { cn } from '@/shared/lib/utils';

const LEVEL_LABELS: Record<string, string> = {
  law: "Luật",
  decree: "Nghị định",
  circular: "Thông tư"
};

export const BiddingChatFileList = () => {
  const [documents, setDocuments] = useState<AiDocumentItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [legalLevel, setLegalLevel] = useState<string>("");
  const [promulgationYear, setPromulgationYear] = useState<number>(new Date().getFullYear());
  const [collectionName, setCollectionName] = useState<string>("bidding_docs");
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isUploading, uploadContextFile } = useBiddingChat();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await aiBiddingApi.getDocuments(); 
      setDocuments(response.data); 
      setCount(response.count);
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách tài liệu", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await aiBiddingApi.getCollections();
      const allCols = Array.from(new Set([...res.activeInChroma, ...res.usedInSql]));
      setAvailableCollections(allCols);
    } catch (e) {}
  };

  useEffect(() => { fetchDocuments(); }, []);

  const openUploadModal = () => {
    fetchCollections();
    setIsUploadOpen(true);
    setUploadFile(null);
    setLegalLevel("");
    setPromulgationYear(new Date().getFullYear());
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !legalLevel || !collectionName) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ các trường bắt buộc.", variant: "destructive" });
      return;
    }

    const result = await uploadContextFile({
      file: uploadFile,
      legalLevel: legalLevel,
      promulgationYear: promulgationYear,
      collectionName: collectionName
    });

    toast({
      title: result.success ? "Thành công" : "Lỗi",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setIsUploadOpen(false);
      setTimeout(fetchDocuments, 1000); 
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await aiBiddingApi.deleteDocument(deleteId);
      toast({ title: "Đã xóa", description: `Đã xóa tài liệu ${deleteId}` });
      fetchDocuments();
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể xóa tài liệu này", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS': return { label: 'Sẵn sàng', color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'PENDING': return { label: 'Đang học', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock className="w-3.5 h-3.5 animate-spin" /> };
      case 'FAILED': return { label: 'Lỗi', color: 'text-red-600 bg-red-50 border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" /> };
      default: return { label: status, color: 'text-gray-600 bg-gray-50', icon: null };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-5">
      
      {/* HEADER */}
      {/* Mobile: flex-col gap-4. PC: flex-row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 md:p-5 rounded-[20px] border shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
            <Database className="w-5 h-5 md:w-5.5 md:h-5.5 text-primary" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Quản lý Tài liệu</h3>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              <span className="text-primary font-bold">{count}</span> documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-2.5 w-full md:w-auto">
          <Button variant="outline" onClick={fetchDocuments} disabled={isLoading} className="rounded-xl h-10 px-4 flex-1 md:flex-none">
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button onClick={openUploadModal} className="rounded-xl h-10 px-5 font-bold shadow-md flex-1 md:flex-none">
            <Upload className="w-4 h-4 mr-2" />
            Nạp mới
          </Button>
        </div>
      </div>

      {/* DOCUMENT GRID */}
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar pb-8">
        {documents.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Chưa có tài liệu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {documents.map((doc) => {
              const status = getStatusConfig(doc.ingestStatus);
              return (
                <div key={doc.id} className="group relative bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 p-4 md:p-5 hover:shadow-lg hover:border-primary/30 transition-all">
                  
                  {/* Delete Button - Mobile: Luôn hiện (mờ). PC: Hover mới hiện */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute top-3 right-3 md:top-4 md:right-4 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteId(doc.sourceFile)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="flex justify-between items-start mb-2 md:mb-3 pr-8">
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider", status.color)}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 md:mb-3 break-all" title={doc.sourceFile}>
                    {doc.sourceFile}
                  </h4>

                  <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase whitespace-nowrap">
                      {LEVEL_LABELS[doc.legalLevel] || doc.legalLevel}
                    </span>
                    {doc.collectionName && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold truncate max-w-[150px]">
                        #{doc.collectionName}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-slate-100 flex items-center gap-3 md:gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {doc.promulgationYear}</span>
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {doc.totalChunks} chunks</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL UPLOAD FORM --- */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="w-[95%] sm:max-w-[500px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Nạp dữ liệu vào Kho tri thức</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Điền đầy đủ thông tin metadata để AI tra cứu chính xác hơn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:gap-5 py-2 md:py-4">
            {/* 1. Chọn File */}
            <div className="grid gap-2">
              <Label htmlFor="file" className="font-semibold">Tài liệu (PDF)</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="cursor-pointer file:text-primary file:font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* 2. Cấp độ pháp lý */}
              <div className="grid gap-2">
                <Label className="font-semibold">Cấp độ</Label>
                <Select value={legalLevel} onValueChange={setLegalLevel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGAL_LEVELS.map((lv) => (
                      <SelectItem key={lv} value={lv}>{LEVEL_LABELS[lv]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Năm ban hành */}
              <div className="grid gap-2">
                <Label htmlFor="year" className="font-semibold">Năm ban hành</Label>
                <Input 
                  id="year" 
                  type="number" 
                  value={promulgationYear}
                  onChange={(e) => setPromulgationYear(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* 4. Collection (Datalist) */}
            <div className="grid gap-2">
              <Label htmlFor="collection" className="font-semibold">Bộ sưu tập (Collection)</Label>
              <Input 
                id="collection"
                list="collection-suggestions"
                placeholder="Nhập hoặc chọn tên nhóm..."
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="rounded-xl"
              />
              <datalist id="collection-suggestions">
                {availableCollections.map((col) => (
                  <option key={col} value={col} />
                ))}
              </datalist>
              <p className="text-[10px] md:text-[11px] text-muted-foreground">Nhập tên mới để tạo nhóm mới.</p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
             <Button variant="ghost" onClick={() => setIsUploadOpen(false)} className="rounded-xl mt-2 sm:mt-0">Hủy</Button>
             <Button onClick={handleUploadSubmit} disabled={isUploading} className="rounded-xl bg-primary font-bold">
                {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tiến hành Ingest
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ALERT DELETE --- */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="w-[95%] rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              Hành động này sẽ xóa file khỏi cả SQL và Vector DB. AI sẽ không thể trả lời câu hỏi liên quan đến file này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl mt-2 sm:mt-0">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">Xóa vĩnh viễn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};