"use client";
import React, { useEffect, useState } from 'react';
import { abacApi, AbacAttribute, AttributeType } from '@/entities/abac';
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
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Edit, Trash2, Plus, Database, Code, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export const AttributeDictionary = () => {
  const { toast } = useToast();
  const [attrs, setAttrs] = useState<AbacAttribute[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    attr_key: '',
    attr_type: 'STRING' as AttributeType,
    source_table: '',
    description: '',
    mapping_path: '' 
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [attrData, tables] = await Promise.all([
        abacApi.getAttributes(),
        abacApi.getSystemTables()
      ]);
      setAttrs(attrData);
      setTableOptions(tables);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
        attr_key: '', 
        attr_type: 'STRING', 
        source_table: '', 
        description: '', 
        mapping_path: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attr: AbacAttribute) => {
    setEditingId(attr.id);
    setFormData({
      attr_key: attr.attr_key,
      attr_type: attr.attr_type,
      source_table: attr.source_table || '',
      description: attr.description || '',
      mapping_path: attr.mapping_path || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source_table) {
        toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng chọn Nguồn dữ liệu." });
        return;
    }

    try {
      if (editingId) {
        await abacApi.updateAttribute(editingId, formData);
        toast({ title: "Thành công", description: "Đã cập nhật thuộc tính.", className: "bg-[#009d98] text-white border-none" });
      } else {
        await abacApi.createAttribute(formData);
        toast({ title: "Thành công", description: "Đã thêm thuộc tính mới.", className: "bg-[#009d98] text-white border-none" });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  };

  const onConfirmDelete = async (id: number) => {
    try {
      await abacApi.deleteAttribute(id);
      toast({ title: "Thành công", description: "Đã xóa thuộc tính.", className: "bg-green-600 text-white border-none" });
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa thuộc tính này." });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
            <h3 className="font-bold text-slate-800 text-lg">Từ điển Thuộc tính</h3>
            <p className="text-xs text-slate-500">Định nghĩa các biến (Attribute) dùng trong chính sách ABAC.</p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto bg-[#009d98] hover:bg-[#008580] text-white shadow-sm font-bold">
          <Plus className="w-4 h-4 mr-2" /> Thêm Thuộc Tính
        </Button>
      </div>

      {/* --- CONTENT LIST --- */}
      
      {/* 1. MOBILE CARD VIEW (Chỉ hiện trên mobile) */}
      <div className="block md:hidden space-y-4">
         {loading ? (
             <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">Đang tải dữ liệu...</div>
         ) : attrs.length === 0 ? (
             <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm italic">Chưa có dữ liệu.</div>
         ) : (
             attrs.map(a => (
                 <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                     {/* Header Card */}
                     <div className="flex justify-between items-start">
                         <div>
                             <div className="font-mono font-bold text-[#009d98] text-sm break-all">{a.attr_key}</div>
                             {a.description && <div className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">{a.description}</div>}
                         </div>
                         
                         {/* Mobile Actions Dropdown */}
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEdit(a)}>
                                    <Edit className="w-4 h-4 mr-2" /> Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onConfirmDelete(a.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                     </div>

                     {/* Badges Info */}
                     <div className="flex flex-wrap gap-2">
                         <Badge variant="outline" className={`font-mono text-[10px] uppercase border ${
                            ['INTEGER', 'DECIMAL'].includes(a.attr_type) ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                            a.attr_type === 'BOOLEAN' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {a.attr_type}
                        </Badge>
                        
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 border border-slate-100">
                            <Database className="w-3 h-3 text-slate-400" /> {a.source_table}
                        </div>
                     </div>

                     {/* Footer Info */}
                     <div className="pt-2 border-t border-slate-50">
                        {a.mapping_path ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono break-all">
                                <Code className="w-3 h-3 text-slate-400 shrink-0" /> {a.mapping_path}
                            </div>
                        ) : <span className="text-xs text-slate-300 italic">Chưa map đường dẫn</span>}
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* 2. DESKTOP TABLE VIEW (Chỉ hiện trên PC) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-bold text-slate-700 pl-6">Attribute Key</TableHead>
              <TableHead className="font-bold text-slate-700 w-[100px]">Type</TableHead>
              <TableHead className="font-bold text-slate-700">Source Table</TableHead>
              <TableHead className="font-bold text-slate-700">Mapping Path</TableHead>
              <TableHead className="font-bold text-slate-700 text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">Đang tải dữ liệu...</TableCell></TableRow>
            ) : attrs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">Chưa có dữ liệu.</TableCell></TableRow>
            ) : attrs.map(a => (
              <TableRow key={a.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-mono font-bold text-[#009d98] text-sm">{a.attr_key}</span>
                        {a.description && <span className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">{a.description}</span>}
                    </div>
                </TableCell>
                <TableCell className="py-4">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase border ${
                        ['INTEGER', 'DECIMAL'].includes(a.attr_type) ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                        a.attr_type === 'BOOLEAN' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {a.attr_type}
                    </Badge>
                </TableCell>
                <TableCell className="py-4 font-medium text-slate-600 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        {a.source_table}
                    </div>
                </TableCell>
                <TableCell className="py-4 font-mono text-xs text-slate-500">
                    {a.mapping_path ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                            <Code className="w-3 h-3 text-slate-400" /> {a.mapping_path}
                        </div>
                    ) : <span className="text-slate-300 italic">-</span>}
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(a)} className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10">
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
                                <AlertDialogTitle className="text-red-600">Xóa thuộc tính hệ thống?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn sắp xóa thuộc tính <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">{a.attr_key}</code>.
                                    <br/>Điều này có thể gây lỗi cho các Policy đang sử dụng nó.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onConfirmDelete(a.id)} className="bg-red-600 hover:bg-red-700 text-white border-none">
                                    Xác nhận xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL FORM */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:max-w-[500px] rounded-xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>{editingId ? 'Cập nhật thuộc tính' : 'Định nghĩa thuộc tính mới'}</DialogTitle>
                <DialogDescription>Khai báo biến dữ liệu để sử dụng trong bộ quy tắc ABAC.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                {/* Mobile: Grid 1 cột. PC: Grid 2 cột */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Attribute Key <span className="text-red-500">*</span></label>
                        <Input 
                            required
                            placeholder="user.department_id"
                            className="font-mono text-sm"
                            value={formData.attr_key}
                            onChange={e => setFormData({...formData, attr_key: e.target.value})}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mapping Path</label>
                        <Input 
                            className="font-mono text-sm bg-slate-50"
                            placeholder="profile.department.id"
                            value={formData.mapping_path}
                            onChange={e => setFormData({...formData, mapping_path: e.target.value})}
                        />
                        <p className="text-[10px] text-slate-400 italic">Đường dẫn truy xuất dữ liệu từ JSON context.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Source Table <span className="text-red-500">*</span></label>
                        <Select value={formData.source_table} onValueChange={(val) => setFormData({...formData, source_table: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn bảng" />
                            </SelectTrigger>
                            <SelectContent>
                                {tableOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Data Type</label>
                        <Select value={formData.attr_type} onValueChange={(val) => setFormData({...formData, attr_type: val as AttributeType})}>
                            <SelectTrigger className="font-mono font-bold text-[#009d98]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'LIST'].map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mô tả</label>
                    <Textarea 
                        placeholder="Giải thích ý nghĩa của thuộc tính này..."
                        className="h-20 resize-none text-sm"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <DialogFooter className="pt-2 flex-col-reverse sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto mt-2 sm:mt-0">Hủy</Button>
                    <Button type="submit" className="bg-[#009d98] hover:bg-[#008580] text-white font-bold w-full sm:w-auto">
                        {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};