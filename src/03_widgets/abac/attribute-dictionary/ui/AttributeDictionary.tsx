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

export const AttributeDictionary = () => {
  const { toast } = useToast();
  const [attrs, setAttrs] = useState<AbacAttribute[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // formData cập nhật theo Schema chuẩn của Backend
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
      // Dữ liệu sẽ đi qua Zod Schema (AttributeTypeSchema) để đảm bảo attr_type hợp lệ
      if (editingId) {
        await abacApi.updateAttribute(editingId, formData);
        toast({ title: "Thành công", description: "Đã cập nhật thuộc tính." });
      } else {
        await abacApi.createAttribute(formData);
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
          <thead className="bg-gray-50 text-gray-600 font-bold border-b text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Attribute Key</th>
              <th className="p-4">Type</th>
              <th className="p-4">Source Table</th>
              <th className="p-4">Mapping Path</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Đang tải dữ liệu từ điển thuộc tính...</td></tr>
            ) : attrs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có thuộc tính nào được định nghĩa.</td></tr>
            ) : attrs.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                    <div className="font-mono text-blue-600 font-bold">{a.attr_key}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1 italic">{a.description || 'Không có mô tả'}</div>
                </td>
                <td className="p-4">
                    <span className={`border px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        a.attr_type === 'INTEGER' || a.attr_type === 'DECIMAL' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {a.attr_type}
                    </span>
                </td>
                <td className="p-4 font-medium text-gray-600">{a.source_table}</td>
                <td className="p-4 font-mono text-[11px] text-gray-500">{a.mapping_path || '-'}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleOpenEdit(a)} className="text-indigo-600 hover:text-indigo-900 font-bold transition-colors">Sửa</button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-red-500 hover:text-red-700 font-bold transition-colors">Xóa</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa thuộc tính?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn sắp xóa thuộc tính <code className="text-blue-600 font-bold">{a.attr_key}</code>.
                          Hành động này có thể làm ảnh hưởng đến các chính sách ABAC đang sử dụng thuộc tính này.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onConfirmDelete(a.id)}
                          className="bg-red-600 hover:bg-red-700 font-bold"
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

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 tracking-tight">{editingId ? 'Sửa thuộc tính' : 'Thêm thuộc tính mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Attribute Key *</label>
                    <input 
                      required
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.attr_key}
                      onChange={e => setFormData({...formData, attr_key: e.target.value})}
                      placeholder="Ví dụ: user.department_id"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Mapping Path</label>
                    <input 
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      value={formData.mapping_path}
                      onChange={e => setFormData({...formData, mapping_path: e.target.value})}
                      placeholder="Ví dụ: profile.department.id"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Đường dẫn lấy dữ liệu từ JSON context.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Source Table *</label>
                    <select 
                      required
                      className="w-full border rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                      value={formData.source_table}
                      onChange={e => setFormData({...formData, source_table: e.target.value})}
                    >
                      <option value="">-- Chọn bảng --</option>
                      {tableOptions.map(table => (
                        <option key={table} value={table}>{table}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Kiểu dữ liệu *</label>
                    <select 
                      className="w-full border rounded-lg p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                      value={formData.attr_type}
                      onChange={e => setFormData({...formData, attr_type: e.target.value as AttributeType})}
                    >
                      <option value="STRING">STRING</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="LIST">LIST</option>
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Mô tả</label>
                <textarea 
                  className="w-full border rounded-lg p-2.5 text-sm outline-none h-16 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="ID phòng ban của người dùng..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all">
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