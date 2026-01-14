"use client";

import { useEffect, useState, useRef } from 'react';
import { 
  FileText, Calendar, Layers, CheckCircle2, Clock, 
  AlertCircle, Upload, Loader2, AlertTriangle, RefreshCw, Database
} from 'lucide-react';

import { useBiddingChat, UPLOAD_WARNING_MESSAGE } from '@/features/bidding-lookup-chat';
import { aiBiddingApi, AiDocumentItem } from '@/entities/ai-bidding';
import { useToast } from '@/shared/lib/hooks/use-toast';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { cn } from '@/shared/lib/utils';

export const BiddingChatFileList = () => {
  const [documents, setDocuments] = useState<AiDocumentItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isUploading, uploadContextFile } = useBiddingChat();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiBiddingApi.getDocuments(); 
      setDocuments(response.data); 
      setCount(response.count);
    } catch (err) {
      setError('Không thể kết nối với máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setIsAlertOpen(true); 
    e.target.value = ""; 
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    setIsAlertOpen(false); 
    const result = await uploadContextFile(pendingFile);
    toast({
      title: result.success ? "Thành công" : "Lỗi",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) setTimeout(fetchDocuments, 500);
    setPendingFile(null);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS': 
        return { label: 'Hoàn tất', color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'PENDING': 
        return { label: 'Đang xử lý', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4 animate-spin" /> };
      case 'FAILED': 
        return { label: 'Lỗi Ingest', color: 'text-red-600 bg-red-50 border-red-200', icon: <AlertCircle className="w-4 h-4" /> };
      default: 
        return { label: status, color: 'text-gray-600 bg-gray-50', icon: null };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      
      {/* HEADER: Cân đối giữa to và nhỏ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-[20px] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Database className="w-5.5 h-5.5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Cơ sở dữ liệu tri thức
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Hiện có <span className="text-primary font-bold">{count}</span> tài liệu đang hoạt động.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <Button variant="outline" onClick={fetchDocuments} disabled={isLoading} className="rounded-xl h-10 px-4">
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Làm mới
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="rounded-xl h-10 px-5 font-bold shadow-md">
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Nạp thêm PDF
          </Button>
        </div>
      </div>

      {/* GRID AREA: 2 cột, card cỡ vừa */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
        {error ? (
          <div className="flex flex-col items-center justify-center h-48 bg-red-50 dark:bg-red-950/10 rounded-2xl border border-red-100 text-red-500">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : documents.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Chưa có tài liệu nào trong kho</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documents.map((doc) => {
              const status = getStatusConfig(doc.ingestStatus);
              return (
                <div 
                  key={doc.id} 
                  className="group bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:bg-primary transition-all duration-300">
                        <FileText className="w-7 h-7 text-primary group-hover:text-white" />
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold border uppercase tracking-wider shadow-sm",
                        status.color
                      )}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={doc.sourceFile}>
                      {doc.sourceFile}
                    </h4>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase">
                        {doc.legalLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{doc.promulgationYear}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{doc.totalChunks} Chunks</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-300 dark:text-slate-700 italic group-hover:text-primary/20 transition-colors">
                      ID-{doc.id.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALERT DIALOG: Cỡ vừa */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-[24px] max-w-md p-7">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận tải tài liệu</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm leading-relaxed">
              {UPLOAD_WARNING_MESSAGE}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={() => setPendingFile(null)} className="rounded-xl h-11 font-bold">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpload} className="bg-amber-500 hover:bg-amber-600 rounded-xl h-11 font-bold">Xác nhận nạp</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};