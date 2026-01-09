"use client";
import React, { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { vi } from 'date-fns/locale';

// Entities
import { biddingProjectApi, BiddingProject } from '@/entities/bidding-project';
import { taskApi } from '@/entities/task';

// UI
import { 
  ArrowLeft, Trash2, Calendar, Building2, 
  CheckCircle2, Clock, Info, MoreVertical,
  PieChart, ExternalLink, AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useToast } from "@/shared/lib/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/shared/ui/dialog";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/shared/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

// Widget
import { ProjectTaskList } from "@/widgets/project-task-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Danh sách task đặc biệt (chỉ cần file là xong)
const FILE_ONLY_TASKS = ["Hồ sơ pháp lý", "Hồ sơ tài chính"];

export default function BiddingProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const projectId = Number(id);
  
  const [project, setProject] = useState<BiddingProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. FETCH PROJECT ---
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoadingProject(true);
        const data = await biddingProjectApi.getById(projectId);
        setProject(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải thông tin dự án" });
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [projectId, toast]);

  // --- 2. FETCH TASKS ---
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getList(projectId),
    enabled: !!projectId,
  });

  // --- 3. CALCULATE STATS ---
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) return { progress: 0, timeLeft: "Chưa có deadline", isUrgent: false, timeBarPercent: 0, daysLeft: 0 };

    // A. Tiến độ
    const parentScores = tasks.map(parent => {
        const isFileTask = FILE_ONLY_TASKS.some(t => parent.taskName.includes(t));
        if (isFileTask) return 100; // Mặc định 100 nếu là task hồ sơ (giả định logic)

        const subTasks = parent.subTasks || [];
        if (subTasks.length === 0) return 0;
        const completedCount = subTasks.filter(s => s.status === 'COMPLETED').length;
        return (completedCount / subTasks.length) * 100;
    });
    const totalScore = parentScores.reduce((a, b) => a + b, 0);
    const progressPercent = Math.round(totalScore / (tasks.length || 1));

    // B. Thời gian
    const allTasksWithDeadline = tasks.flatMap(t => [t, ...(t.subTasks || [])]);
    const futureDeadlines = allTasksWithDeadline
        .map(t => t.deadline ? new Date(t.deadline).getTime() : 0)
        .filter(d => d > 0); // Lấy tất cả deadline (cả quá khứ)
    
    let timeLeftString = "---";
    let isUrgent = false;
    let timeBarPercent = 0;
    let daysRemaining = 0;

    if (futureDeadlines.length > 0) {
        // Tìm deadline gần nhất (Min)
        const minDeadlineTimestamp = Math.min(...futureDeadlines);
        const minDeadline = new Date(minDeadlineTimestamp);
        const now = new Date();
        
        daysRemaining = differenceInCalendarDays(minDeadline, now);

        if (daysRemaining < 0) {
            timeLeftString = "Đã quá hạn";
            isUrgent = true;
            timeBarPercent = 100; // Full đỏ
        } else {
            timeLeftString = formatDistanceToNow(minDeadline, { locale: vi, addSuffix: true });
            
            // Logic Time Bar:
            // > 7 ngày: Xanh (An toàn)
            // 3-7 ngày: Vàng (Cảnh báo)
            // < 3 ngày: Đỏ (Gấp)
            if (daysRemaining > 7) {
                isUrgent = false;
                timeBarPercent = 25; 
            } else if (daysRemaining > 3) {
                isUrgent = false; // Vẫn chưa urgent lắm, nhưng warning
                timeBarPercent = 60;
            } else {
                isUrgent = true;
                timeBarPercent = 90;
            }
        }
    }

    return { progress: progressPercent, timeLeft: timeLeftString, isUrgent, timeBarPercent, daysLeft: daysRemaining };
  }, [tasks]);

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await biddingProjectApi.delete(projectId);
      toast({ title: "Đã xóa dự án", className: "bg-green-600 text-white border-none" });
      router.push('/bidding-projects'); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi xóa dự án", description: error?.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingProject) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#009d98]"></div>
       <p className="text-slate-500 text-sm animate-pulse">Đang tải dữ liệu dự án...</p>
    </div>
  );
  
  if (!project) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy dự án</h2>
        <Button variant="link" onClick={() => router.back()}>Quay lại</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* --- 1. HEADER SECTION (Compact & Clean) --- */}
      <div className="bg-white border-b border-slate-200 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          
          {/* Top Bar: Back + Title + Actions */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4 min-w-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-0.5 h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-500 bg-slate-50 border-slate-200">
                            ID: #{project.id}
                        </Badge>
                        <Badge className={cn(
                            "text-[10px] font-bold border-0",
                            project.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>
                            {project.status}
                        </Badge>
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug truncate" title={project.name}>
                        {project.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" /> 
                            <span>Chủ trì: <span className="text-slate-700 font-semibold">{project.hostId}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                            <span>Tạo: {new Date(project.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#009d98] hidden md:flex gap-1.5">
                            <Info className="w-4 h-4" /> Info
                         </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#009d98]">Gói thầu liên kết</DialogTitle>
                        </DialogHeader>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[120px]">Mã TBMT</TableHead>
                                    <TableHead>Tên gói thầu</TableHead>
                                    <TableHead className="text-right w-[120px]">Ngày đăng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(project.packages || []).map((pkg) => (
                                    <TableRow key={pkg.maTbmt}>
                                        <TableCell className="font-mono text-[#009d98] font-bold text-xs">{pkg.maTbmt}</TableCell>
                                        <TableCell className="font-medium text-sm">{pkg.tenGoiThau}</TableCell>
                                        <TableCell className="text-right text-xs text-slate-500">{new Date(pkg.ngayDangTai).toLocaleDateString('vi-VN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                </Dialog>

                {/* Drive Button (Primary Action) */}
                <Button 
                    className="gap-2 bg-[#009d98] hover:bg-[#008580] shadow-sm font-semibold h-9 px-4"
                    onClick={() => {
                        const folderId = project.driveFolderId || (project as any).drive_folder_id;
                        if (folderId) {
                            window.open(`https://drive.google.com/drive/folders/${folderId}`, '_blank');
                            toast({ title: "Đang mở Drive", description: "Chuyển hướng đến kho lưu trữ...", className: "bg-[#009d98] text-white border-none" });
                        } else {
                            toast({ variant: "destructive", title: "Chưa liên kết", description: "Dự án này chưa có thư mục Drive." });
                        }
                    }}
                >
                    <ExternalLink className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Mở Drive</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa dự án
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600">Cảnh báo xóa dữ liệu</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa dự án <strong>{project.name}</strong> không? <br/>
                                        Hành động này không thể hoàn tác và sẽ xóa toàn bộ tiến độ công việc liên quan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa vĩnh viễn</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {/* Stats Grid (Compact) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
             
             {/* 1. DEADLINE CARD */}
             <div className={cn(
                 "col-span-2 md:col-span-1 rounded-xl p-3 border shadow-sm transition-all relative overflow-hidden flex flex-col justify-center",
                 stats.isUrgent ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
             )}>
                {/* Background Decor */}
                <Clock className={cn("absolute right-2 top-2 w-8 h-8 opacity-10", stats.isUrgent ? "text-red-500" : "text-slate-400")} />
                
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    {stats.isUrgent && <AlertTriangle className="w-3 h-3 text-red-500" />} Deadline
                </h3>
                <div className={cn("text-lg font-black leading-none", stats.isUrgent ? "text-red-600" : "text-slate-800")}>
                    {stats.timeLeft}
                </div>
                
                {/* Time Bar */}
                <div className="w-full bg-black/5 rounded-full h-1 mt-2 overflow-hidden">
                    <div 
                        className={cn("h-full rounded-full transition-all duration-500", 
                            stats.daysLeft < 3 ? "bg-red-500" : 
                            stats.daysLeft < 7 ? "bg-amber-500" : "bg-emerald-500"
                        )} 
                        style={{ width: `${stats.timeBarPercent}%` }}
                    ></div>
                </div>
             </div>

             {/* 2. PROGRESS CARD */}
             <div className="col-span-2 md:col-span-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <PieChart className="absolute right-2 top-2 w-8 h-8 text-blue-500 opacity-10" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tiến độ</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600 tabular-nums">{stats.progress}</span>
                    <span className="text-xs font-bold text-blue-400">%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
                </div>
             </div>

             {/* 3. Placeholder for future stats (Optional) */}
             <div className=" md:block col-span-2 bg-slate-50 rounded-xl border border-slate-100 border-dashed p-3 flex items-center justify-center text-xs text-slate-400">
                 Khu vực thống kê mở rộng (Nhân sự / Ngân sách)
             </div>

          </div>

        </div>
      </div>

      {/* --- 2. MAIN CONTENT (Task List) --- */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50">
         <div className="h-full max-w-7xl mx-auto">
             <ProjectTaskList 
                projectId={projectId} 
                driveFolderId={project.driveFolderId || (project as any).drive_folder_id}
                projectName={project.name}
             />
         </div>
      </div>

    </div>
  );
}