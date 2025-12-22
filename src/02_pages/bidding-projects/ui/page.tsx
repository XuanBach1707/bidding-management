"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { biddingProjectApi, BiddingProject } from '@/entities/bidding-project';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, Package, Trash2, Calendar, User2, Building, ListChecks } from 'lucide-react'; // Thêm icon ListChecks
import { Button } from '@/shared/ui/button';
import { useToast } from "@/shared/lib/hooks/use-toast";

// [MỚI] Import Widget danh sách công việc
import { ProjectTaskList } from "@/widgets/project-task-list";

// Import Shadcn AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BiddingProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<BiddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await biddingProjectApi.getById(Number(id));
        setProject(data);
      } catch (error) {
        console.error("Lỗi fetch dự án:", error);
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải thông tin dự án" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id, toast]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await biddingProjectApi.delete(Number(id));
      toast({ title: "Thành công", description: "Dự án đã được xóa." });
      router.push('/opportunities'); 
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi xóa dự án", 
        description: error?.message || "Đã có lỗi xảy ra khi xóa." 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium tracking-tight">Đang tải thông tin dự án...</div>;
  if (!project) return <div className="p-10 text-center text-red-500 font-medium">Không tìm thấy dự án.</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-50/20">
      {/* Nút quay lại */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-slate-400 hover:text-slate-900 transition-all">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight max-w-4xl tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono italic">Project Reference: #{project.id}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="font-bold">Chỉnh sửa</Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={isDeleting}
                  className="font-bold gap-2 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> 
                  {isDeleting ? "Đang xóa..." : "Xóa dự án"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa dự án?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ xóa vĩnh viễn dự án <strong>{project.name}</strong> và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Xác nhận xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Thông tin nhân sự */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition-colors">
            <div className="p-2.5 bg-purple-100 rounded-lg"><User2 className="h-4 w-4 text-purple-600" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Team Leader ID</p>
              <p className="text-sm font-bold text-slate-700">{project.bidTeamLeaderId || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition-colors">
            <div className="p-2.5 bg-blue-100 rounded-lg"><Building className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Host ID</p>
              <p className="text-sm font-bold text-slate-700">{project.hostId || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100/50 transition-colors">
            <div className="p-2.5 bg-emerald-100 rounded-lg"><Calendar className="h-4 w-4 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ngày tạo</p>
              <p className="text-sm font-bold text-slate-700">
                {new Date(project.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng gói thầu */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="bg-white border-b py-4 px-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-base font-bold text-slate-700">Các gói thầu liên kết</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Mã TBMT</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Tên gói thầu</TableHead>
                <TableHead className="font-bold text-slate-500 text-right pr-6 uppercase text-[10px] tracking-wider">Ngày đăng tải</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.packages.map((pkg) => (
                <TableRow key={pkg.maTbmt} className="hover:bg-blue-50/30 transition-colors border-slate-100">
                  <TableCell className="pl-6 font-mono text-blue-600 font-bold text-xs">{pkg.maTbmt}</TableCell>
                  <TableCell className="font-medium text-slate-700 text-sm leading-relaxed">{pkg.tenGoiThau}</TableCell>
                  <TableCell className="pr-6 text-right text-slate-500 text-xs">
                    {new Date(pkg.ngayDangTai).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* [MỚI] Phần danh sách công việc được tích hợp */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="bg-white border-b py-4 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base font-bold text-slate-700">Tiến độ công việc thầu</CardTitle>
          </div>
          {/* Bạn có thể thêm nút "Tạo Task" ở đây sau này */}
        </CardHeader>
        <CardContent className="p-6">
          <ProjectTaskList projectId={Number(id)} />
        </CardContent>
      </Card>
    </div>
  );
}