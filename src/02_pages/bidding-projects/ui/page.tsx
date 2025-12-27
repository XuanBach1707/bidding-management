"use client";
import React, { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Entities
import { biddingProjectApi, BiddingProject } from '@/entities/bidding-project';
import { taskApi } from '@/entities/task';

// UI
import { 
  ArrowLeft, Trash2, Calendar, Building, 
  Download, CheckCircle2, AlertCircle, Clock, Info, MoreVertical,
  PieChart 
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
import { cn } from "@/shared/lib/utils";

// Widget
import { ProjectTaskList } from "@/widgets/project-task-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

// [QUAN TRỌNG] Định nghĩa lại danh sách này để đồng bộ logic tính điểm
const FILE_ONLY_TASKS = ["Hồ sơ pháp lý", "Hồ sơ tài chính"];

export default function BiddingProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const projectId = Number(id);
  
  const [project, setProject] = useState<BiddingProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. FETCH PROJECT INFO ---
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

  // --- 3. CALCULATE STATS (Đã sửa logic đồng bộ với bảng bên dưới) ---
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) return { progress: 0, timeLeft: "---", isUrgent: false, warnings: [] };

    // --- A. TÍNH TIẾN ĐỘ TỔNG THỂ ---
    // Logic: Tính % của từng đầu mục cha, sau đó chia trung bình.
    const parentScores = tasks.map(parent => {
        // 1. Nếu là Task Hồ sơ đặc biệt -> 100 điểm
        const isFileTask = FILE_ONLY_TASKS.some(t => parent.taskName.includes(t));
        if (isFileTask) return 100;

        // 2. Nếu là Task thường -> Tính theo subtask
        const subTasks = parent.subTasks || [];
        if (subTasks.length === 0) return 0;

        const completedCount = subTasks.filter(s => s.status === 'COMPLETED').length;
        return (completedCount / subTasks.length) * 100;
    });

    const totalScore = parentScores.reduce((a, b) => a + b, 0);
    const progressPercent = Math.round(totalScore / tasks.length);

    // --- B. TÍNH THỜI GIAN & CẢNH BÁO ---
    const allTasksWithDeadline = tasks.flatMap(t => [t, ...(t.subTasks || [])]);
    
    // Thời gian
    const futureDeadlines = allTasksWithDeadline
        .map(t => t.deadline ? new Date(t.deadline).getTime() : 0)
        .filter(d => d > Date.now());
    
    let timeLeftString = "---";
    let isUrgent = false;

    if (futureDeadlines.length > 0) {
        const minDeadline = Math.min(...futureDeadlines);
        timeLeftString = formatDistanceToNow(new Date(minDeadline), { locale: vi });
        // Còn dưới 2 ngày thì báo gấp
        if (minDeadline - Date.now() < 2 * 24 * 60 * 60 * 1000) isUrgent = true;
    } else if (allTasksWithDeadline.some(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED')) {
        timeLeftString = "Quá hạn";
        isUrgent = true;
    }

    // Cảnh báo (Loại bỏ warning của những task hồ sơ đã được coi là xong)
    const warnings = allTasksWithDeadline.filter(t => {
        // Nếu task cha nằm trong nhóm File Only -> Bỏ qua warning (vì coi như xong rồi)
        const isFileTask = FILE_ONLY_TASKS.some(ft => t.taskName.includes(ft));
        if (isFileTask) return false;

        return t.status === 'REJECTED' || 
               (t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED');
    });

    return { progress: progressPercent, timeLeft: timeLeftString, isUrgent, warnings };
  }, [tasks]);

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await biddingProjectApi.delete(projectId);
      toast({ title: "Thành công", description: "Dự án đã được xóa." });
      router.push('/opportunities'); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error?.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingProject) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!project) return <div className="p-10 text-center text-red-500">Không tìm thấy dự án.</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER SECTION (Fixed) */}
      <div className="bg-white border-b shadow-sm z-20 flex-shrink-0">
        <div className="px-6 py-4">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 h-8 w-8 text-slate-400 hover:text-slate-900">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                        {project.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: #{project.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Building className="w-3 h-3" /> Chủ trì: {project.hostId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline" className="gap-2 text-slate-600">
                            <Info className="w-4 h-4" /> Chi tiết gói thầu
                         </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Danh sách gói thầu liên kết</DialogTitle>
                        </DialogHeader>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Mã TBMT</TableHead>
                                    <TableHead>Tên gói thầu</TableHead>
                                    <TableHead className="text-right">Ngày đăng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {project.packages.map((pkg) => (
                                    <TableRow key={pkg.maTbmt}>
                                        <TableCell className="font-mono text-blue-600 font-bold">{pkg.maTbmt}</TableCell>
                                        <TableCell>{pkg.tenGoiThau}</TableCell>
                                        <TableCell className="text-right">{new Date(pkg.ngayDangTai).toLocaleDateString('vi-VN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" className="gap-2 text-slate-600">
                    <Download className="w-4 h-4" /> Xuất báo cáo
                </Button>
                
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 font-bold shadow-sm shadow-blue-200">
                    <CheckCircle2 className="w-4 h-4" /> Tổng hợp hồ sơ & Nộp
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
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
                                    <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                    <AlertDialogDescription>Dự án <strong>{project.name}</strong> sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {/* Stats Grid (REAL DATA) */}
          <div className="grid grid-cols-4 gap-4">
             <div className="bg-white border rounded-xl p-3 px-4 shadow-sm flex flex-col justify-center">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thời gian còn lại</h3>
                <div className="flex items-center gap-2">
                    <Clock className={cn("w-5 h-5", stats.isUrgent ? "text-red-500" : "text-orange-500")} />
                    <span className={cn("text-xl font-black", stats.isUrgent ? "text-red-600" : "text-slate-800")}>
                        {stats.timeLeft}
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className={cn("h-1.5 rounded-full", stats.isUrgent ? "bg-red-500" : "bg-orange-500")} style={{ width: '70%' }}></div>
                </div>
             </div>

             {/* TIẾN ĐỘ TỔNG THỂ (Đã được sửa) */}
             <div className="bg-white border rounded-xl p-3 px-4 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ tổng thể</h3>
                    <PieChart className={cn("w-4 h-4", stats.progress === 100 ? "text-emerald-500" : "text-blue-500")} />
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-xl font-black text-slate-800">{stats.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
                </div>
             </div>

             <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl p-3 px-4 shadow-sm flex flex-col justify-center overflow-y-auto">
                <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Vấn đề cần xử lý ({stats.warnings.length})
                </h3>
                {stats.warnings.length > 0 ? (
                    <div className="text-xs font-medium text-slate-800 space-y-1 mt-1">
                        {stats.warnings.slice(0, 2).map((w) => (
                            <p key={w.id} className="truncate">
                                • {w.taskName}: <span className="text-red-600 font-bold">{w.status === 'REJECTED' ? 'Bị từ chối' : 'Quá hạn'}</span>
                            </p>
                        ))}
                        {stats.warnings.length > 2 && (
                            <p className="text-slate-500 italic text-[10px] pl-2">+ {stats.warnings.length - 2} vấn đề khác...</p>
                        )}
                    </div>
                ) : (
                    <div className="text-xs font-medium text-emerald-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hiện tại chưa phát hiện vấn đề nghiêm trọng.
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative">
         <ProjectTaskList projectId={projectId} />
      </div>

    </div>
  );
}