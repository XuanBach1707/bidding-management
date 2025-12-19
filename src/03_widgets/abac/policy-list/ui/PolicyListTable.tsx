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
      });
      fetchPolicies(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa chính sách này. Vui lòng thử lại sau."
      });
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500 italic">Đang tải danh sách chính sách...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
          <tr>
            <th className="p-4 border-b w-20 text-center">Priority</th>
            <th className="p-4 border-b">Tên Chính Sách</th>
            <th className="p-4 border-b">Resource / Action</th>
            <th className="p-4 border-b">Effect</th>
            <th className="p-4 border-b text-center">Trạng thái</th>
            <th className="p-4 border-b text-right pr-10">Thao tác</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {policies.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-400 italic">Chưa có chính sách nào. Hãy tạo mới.</td>
            </tr>
          ) : (
            policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50 border-b last:border-b-0 transition-colors">
                <td className="p-4 text-center">
                  <span className={`inline-block w-8 h-8 leading-8 text-center rounded-full font-bold text-xs ${
                    policy.priority > 10 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {policy.priority}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{policy.name}</div>
                  {policy.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{policy.description}</div>}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-fit">{policy.target_resource}</span>
                    <div className="flex gap-1 flex-wrap">
                      {policy.action.map((act) => (
                        <span key={act} className="text-[10px] border border-gray-200 px-1.5 rounded bg-white text-gray-600 uppercase font-medium">{act}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold ${
                    policy.effect === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {policy.effect}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`w-2.5 h-2.5 inline-block rounded-full ${policy.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></span>
                </td>
                <td className="p-4 text-right pr-6">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onEdit(policy)} 
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors"
                    >
                      Sửa
                    </button>

                    {/* ALERT DIALOG CHO HÀNH ĐỘNG XÓA */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">
                          Xóa
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa chính sách?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa <strong>{policy.name}</strong>? 
                            Hành động này sẽ gỡ bỏ các ràng buộc truy cập liên quan và không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => policy.id && onConfirmDelete(policy.id, policy.name)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Xác nhận xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};