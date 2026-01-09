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
  PieChart, ExternalLink, AlertTriangle, Layers
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
        if (isFileTask) return 100; 

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
        .filter(d => d > 0); 
    
    let timeLeftString = "---";
    let isUrgent = false;
    let timeBarPercent = 0;
    let daysRemaining = 0;

    if (futureDeadlines.length > 0) {
        const minDeadlineTimestamp = Math.min(...futureDeadlines);
        const minDeadline = new Date(minDeadlineTimestamp);
        const now = new Date();
        
        daysRemaining = differenceInCalendarDays(minDeadline, now);

        if (daysRemaining < 0) {
            timeLeftString = "Đã quá hạn";
            isUrgent = true;
            timeBarPercent = 100; 
        } else {
            timeLeftString = formatDistanceToNow(minDeadline, { locale: vi, addSuffix: true });
            
            if (daysRemaining > 7) {
                isUrgent = false;
                timeBarPercent = 25; 
            } else if (daysRemaining > 3) {
                isUrgent = false; 
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
       <p className="text-slate-500 text-sm font-bold animate-pulse">Đang tải dữ liệu dự án...</p>
    </div>
  );
  
  if (!project) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
       <h2 className="text-xl font-bold text-slate-800">Không tìm thấy dự án</h2>
       <Button variant="link" onClick={() => router.back()} className="text-[#009d98]">Quay lại</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* --- 1. HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-200 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-5">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start gap-6">
            <div className="flex items-start gap-4 min-w-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 h-9 w-9 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10 rounded-full transition-colors border border-transparent hover:border-[#009d98]/20">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-500 bg-slate-50 border-slate-200">
                            ID: #{project.id}
                        </Badge>
                        <Badge className={cn(
                            "text-[10px] font-bold border-0 uppercase tracking-wider",
                            project.status === 'ACTIVE' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-blue-500 text-white"
                        )}>
                            {project.status}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-snug truncate" title={project.name}>
                        {project.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400" /> 
                            <span>Chủ trì: <span className="text-slate-900 font-bold">{project.hostId}</span></span>
                        </div>
                        <div className="w-px h-3 bg-slate-300"></div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" /> 
                            <span>Tạo ngày: <span className="text-slate-900">{new Date(project.createdAt).toLocaleDateString('vi-VN')}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 mt-2">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 hover:border-[#009d98] hover:text-[#009d98] gap-2 hidden md:flex">
                            <Info className="w-4 h-4" /> Chi tiết gói thầu
                         </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#009d98]">Gói thầu liên kết</DialogTitle>
                        </DialogHeader>
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[120px] font-bold text-slate-700">Mã TBMT</TableHead>
                                        <TableHead className="font-bold text-slate-700">Tên gói thầu</TableHead>
                                        <TableHead className="text-right w-[120px] font-bold text-slate-700">Ngày đăng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(project.packages || []).map((pkg) => (
                                        <TableRow key={pkg.maTbmt} className="hover:bg-slate-50">
                                            <TableCell className="font-mono text-[#009d98] font-bold text-xs">{pkg.maTbmt}</TableCell>
                                            <TableCell className="font-medium text-sm text-slate-700">{pkg.tenGoiThau}</TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">{new Date(pkg.ngayDangTai).toLocaleDateString('vi-VN')}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(project.packages || []).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-slate-400 italic py-8">Chưa có thông tin gói thầu</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Drive Button (Primary Action) */}
                <Button 
                    className="gap-2 bg-[#009d98] hover:bg-[#008580] shadow-md font-bold h-9 px-5 transition-all active:scale-95"
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
                        <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 text-slate-500 hover:text-slate-800"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium">
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
                                    <AlertDialogCancel className="border-slate-200">Hủy bỏ</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold">Xóa vĩnh viễn</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              
              {/* 1. DEADLINE CARD */}
              <div className={cn(
                  "col-span-2 md:col-span-1 rounded-xl p-4 border shadow-sm transition-all relative overflow-hidden flex flex-col justify-center h-[90px]",
                  stats.isUrgent ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
              )}>
                <Clock className={cn("absolute right-3 top-3 w-10 h-10 opacity-[0.08]", stats.isUrgent ? "text-red-600" : "text-slate-900")} />
                
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    {stats.isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />} Deadline
                </h3>
                <div className={cn("text-xl font-black leading-none tracking-tight", stats.isUrgent ? "text-red-600" : "text-slate-800")}>
                    {stats.timeLeft}
                </div>
                
                {/* Time Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
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
             <div className="col-span-2 md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden h-[90px]">
                <PieChart className="absolute right-3 top-3 w-10 h-10 text-[#009d98] opacity-[0.08]" />
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Tiến độ tổng thể</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#009d98] tabular-nums">{stats.progress}</span>
                    <span className="text-xs font-bold text-[#009d98]/60">%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-[#009d98] h-full rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
                </div>
             </div>

             {/* 3. Placeholder Stats */}
             <div className="hidden md:flex col-span-2 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-4 items-center justify-center text-xs font-medium text-slate-400 gap-2 h-[90px]">
                 <Layers className="w-5 h-5 opacity-50" />
                 <span>Khu vực dành cho thống kê mở rộng (Nhân sự / Ngân sách / Rủi ro)</span>
             </div>

          </div>

        </div>
      </div>

      {/* --- 2. MAIN CONTENT (Task List) --- */}
      <div className="flex-1 overflow-hidden relative bg-slate-50">
         <div className="h-full max-w-7xl mx-auto border-x border-slate-200 bg-white shadow-sm">
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