"use client";
import React, { useEffect, useState } from 'react';
import { abacApi, AbacAttribute } from '@/entities/abac';
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

export const AttributeDictionary = () => {
  const { toast } = useToast();
  const [attrs, setAttrs] = useState<AbacAttribute[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    attr_key: '',
    attr_type: 'STRING',
    source_table: '',
    description: ''
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
    setFormData({ attr_key: '', attr_type: 'STRING', source_table: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attr: AbacAttribute) => {
    setEditingId(attr.id);
    setFormData({
      attr_key: attr.attr_key,
      attr_type: attr.attr_type,
      source_table: attr.source_table || '',
      description: attr.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source_table) {
        toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng chọn Nguồn dữ liệu (Source Table)." });
        return;
    }

    try {
      if (editingId) {
        await abacApi.updateAttribute(editingId, formData as any);
        toast({ title: "Thành công", description: "Đã cập nhật thuộc tính." });
      } else {
        await abacApi.createAttribute(formData as any);
        toast({ title: "Thành công", description: "Đã thêm thuộc tính mới." });
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
      toast({ title: "Thành công", description: "Đã xóa thuộc tính." });
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa thuộc tính này." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={handleOpenAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm font-bold transition-all"
        >
          + Thêm Thuộc Tính
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-bold border-b text-xs uppercase">
            <tr>
              <th className="p-4">Attribute Key</th>
              <th className="p-4">Type</th>
              <th className="p-4">Source Table</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : attrs.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-mono text-blue-600 font-bold">{a.attr_key}</td>
                <td className="p-4 text-xs">
                    <span className="bg-slate-100 border px-2 py-0.5 rounded font-bold uppercase">{a.attr_type}</span>
                </td>
                <td className="p-4 font-medium text-gray-600">{a.source_table}</td>
                <td className="p-4 text-gray-400 italic">{a.description || '-'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleOpenEdit(a)} className="text-indigo-600 hover:text-indigo-900 font-bold">Sửa</button>
                  
                  {/* Tích hợp AlertDialog vào đây */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-red-500 hover:text-red-700 font-bold">Xóa</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa thuộc tính?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn sắp xóa thuộc tính <code className="text-blue-600 font-bold">{a.attr_key}</code>. 
                          Nếu có chính sách nào đang sử dụng thuộc tính này, logic kiểm tra có thể bị lỗi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onConfirmDelete(a.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Xác nhận xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL (Giữ nguyên logic cũ của bạn) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-800">{editingId ? 'Sửa thuộc tính' : 'Thêm thuộc tính mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-left">Attribute Key *</label>
                <input 
                  required
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.attr_key}
                  onChange={e => setFormData({...formData, attr_key: e.target.value})}
                  placeholder="Ví dụ: user.role"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-left">Nguồn dữ liệu (Source Table) *</label>
                <select 
                  required
                  className="w-full border rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  value={formData.source_table}
                  onChange={e => setFormData({...formData, source_table: e.target.value})}
                >
                  <option value="">-- Chọn bảng hệ thống --</option>
                  {tableOptions.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 italic">Thuộc tính này thuộc về bảng nào trong DB?</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-left">Kiểu dữ liệu *</label>
                <select 
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.attr_type}
                  onChange={e => setFormData({...formData, attr_type: e.target.value})}
                >
                  <option value="STRING">STRING</option>
                  <option value="NUMBER">NUMBER</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="DATETIME">DATETIME</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase text-left">Mô tả</label>
                <textarea 
                  className="w-full border rounded-lg p-2.5 text-sm outline-none h-20"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 font-medium">Hủy</button>
                <button type="submit" className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition-all">
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};