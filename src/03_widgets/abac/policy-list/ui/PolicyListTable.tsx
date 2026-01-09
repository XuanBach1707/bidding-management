import React, { useEffect, useState } from 'react';
import { abacApi, AbacPolicy } from '@/entities/abac';
import { useToast } from "@/shared/lib/hooks/use-toast";
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
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Edit, Trash2, ShieldCheck, ShieldAlert, ArrowRight, Layers } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";

interface PolicyListTableProps {
  onEdit: (policy: AbacPolicy) => void;
}

export const PolicyListTable: React.FC<PolicyListTableProps> = ({ onEdit }) => {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<AbacPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await abacApi.getPolicies();
      // Sort by Priority (High to Low)
      const sortedData = [...data].sort((a, b) => b.priority - a.priority);
      setPolicies(sortedData);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const onConfirmDelete = async (id: number, name: string) => {
    try {
      await abacApi.deletePolicy(id);
      toast({
        title: "Đã xóa",
        description: `Chính sách "${name}" đã được gỡ bỏ thành công.`,
        className: "bg-green-600 text-white border-none"
      });
      fetchPolicies(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi xóa chính sách",
        description: "Không thể xóa chính sách này. Vui lòng thử lại sau."
      });
    }
  };

  // --- RENDER ---
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 border-b border-slate-200">
          <TableRow>
            <TableHead className="w-[80px] text-center font-bold text-slate-700">Priority</TableHead>
            <TableHead className="font-bold text-slate-700">Tên Chính Sách</TableHead>
            <TableHead className="font-bold text-slate-700">Tài nguyên & Hành động</TableHead>
            <TableHead className="w-[120px] font-bold text-slate-700">Effect</TableHead>
            <TableHead className="w-[100px] text-center font-bold text-slate-700">Trạng thái</TableHead>
            <TableHead className="w-[100px] text-right font-bold text-slate-700 pr-6">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                   <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-32" /></TableCell>
                   <TableCell><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-5 w-40" /></TableCell>
                   <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-4 rounded-full mx-auto" /></TableCell>
                   <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
             ))
          ) : policies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                 <div className="flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 opacity-20" />
                    <span>Chưa có chính sách nào được thiết lập.</span>
                 </div>
              </TableCell>
            </TableRow>
          ) : (
            policies.map((policy) => (
              <TableRow key={policy.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                
                {/* 1. PRIORITY */}
                <TableCell className="text-center py-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border ${
                    policy.priority >= 100 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : policy.priority >= 50
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {policy.priority}
                  </div>
                </TableCell>

                {/* 2. NAME & DESC */}
                <TableCell className="py-4">
                  <div className="flex flex-col">
                     <span className="font-bold text-slate-800 text-sm group-hover:text-[#009d98] transition-colors">{policy.name}</span>
                     {policy.description && (
                        <span className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xs" title={policy.description}>
                           {policy.description}
                        </span>
                     )}
                  </div>
                </TableCell>

                {/* 3. RESOURCE & ACTION */}
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    {/* Resource Tag */}
                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 text-slate-600 border-slate-200 shadow-none">
                       {policy.target_resource}
                    </Badge>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-1">
                      {policy.action.map((act) => (
                        <span key={act} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-medium uppercase tracking-wide">
                           {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </TableCell>

                {/* 4. EFFECT (ALLOW/DENY) */}
                <TableCell className="py-4">
                   {policy.effect === 'ALLOW' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none gap-1 pl-1 pr-2">
                         <ShieldCheck className="w-3 h-3" /> ALLOW
                      </Badge>
                   ) : (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 shadow-none gap-1 pl-1 pr-2">
                         <ShieldAlert className="w-3 h-3" /> DENY
                      </Badge>
                   )}
                </TableCell>

                {/* 5. STATUS (Active/Inactive) */}
                <TableCell className="text-center py-4">
                   <div className="flex justify-center">
                      <span className={`relative flex h-3 w-3 ${!policy.is_active ? 'opacity-50 grayscale' : ''}`}>
                        {policy.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${policy.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </span>
                   </div>
                </TableCell>

                {/* 6. ACTIONS */}
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(policy)} className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10">
                       <Edit className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600">Xóa chính sách bảo mật?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa chính sách <strong>{policy.name}</strong>? <br/>
                            Hành động này sẽ thay đổi quyền truy cập hệ thống ngay lập tức.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => policy.id && onConfirmDelete(policy.id, policy.name)}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                          >
                            Xác nhận xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>

              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};