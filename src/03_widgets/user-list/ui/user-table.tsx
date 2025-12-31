"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import { 
  User, userApi, 
  USER_ROLE_LABELS, SECURITY_LEVEL_LABELS 
} from "@/entities/user";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Edit, Trash2, UserPlus, ShieldAlert, Briefcase, Building2, Building, ChevronRight, CornerDownRight } from "lucide-react";
import { UserFormDialog, DeleteUserAlert } from "@/features/manage-user";

export const UserTableWidget = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const groupedStructure = useMemo(() => {
    const hierarchy: Record<string, Record<string, User[]>> = {};
    
    users.forEach((user) => {
      const parentName = user.parentOrgUnitName || user.orgUnitName || "Khác";
      const childName = user.orgUnitName || "Chưa phân bổ";

      if (!hierarchy[parentName]) {
        hierarchy[parentName] = {};
      }
      if (!hierarchy[parentName][childName]) {
        hierarchy[parentName][childName] = [];
      }

      hierarchy[parentName][childName].push(user);
    });

    // --- [LOGIC SẮP XẾP MỚI] ---
    const sortedParents = Object.entries(hierarchy).sort((a, b) => {
      const nameA = a[0];
      const nameB = b[0];
      const priorityName = "Khối Đảm bảo Kinh doanh"; // Tên cần ưu tiên

      // Nếu A là priority -> A lên đầu (-1)
      if (nameA === priorityName) return -1;
      // Nếu B là priority -> B lên đầu (1)
      if (nameB === priorityName) return 1;

      // Còn lại sắp xếp ABC bình thường
      return nameA.localeCompare(nameB);
    });

    return sortedParents.map(([parentName, childrenObj]) => {
      const sortedChildren = Object.entries(childrenObj).sort((a, b) => a[0].localeCompare(b[0]));
      return {
        parentName,
        children: sortedChildren 
      };
    });
  }, [users]);

  // Handlers
  const handleCreate = () => { setEditingUser(null); setIsFormOpen(true); };
  const handleEdit = (user: User) => { setEditingUser(user); setIsFormOpen(true); };
  const handleDelete = (id: number) => { setDeletingUserId(id); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div>
           <h2 className="text-lg font-bold text-gray-800">Danh sách nhân sự</h2>
           <p className="text-sm text-gray-500">Quản lý tài khoản theo Cơ cấu tổ chức</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
           <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân sự
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-100 border-b border-slate-200">
            <TableRow>
              <TableHead className="w-[60px] pl-4">ID</TableHead>
              <TableHead>Họ và tên / Email</TableHead>
              <TableHead>Vai trò & Chức vụ</TableHead>
              <TableHead>Bảo mật</TableHead>
              <TableHead className="text-right pr-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24">Đang tải dữ liệu...</TableCell></TableRow>
            ) : users.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24">Chưa có nhân sự nào.</TableCell></TableRow>
            ) : (
               // Loop Level 1: Parent (Ban/Khối)
               groupedStructure.map(({ parentName, children }) => (
                 <Fragment key={`parent-${parentName}`}>
                   
                   {/* --- LEVEL 1 HEADER (BAN/KHỐI) --- */}
                   <TableRow className="bg-slate-200/70 hover:bg-slate-200 border-b border-white">
                     <TableCell colSpan={5} className="py-3 pl-4">
                       <div className="flex items-center gap-2">
                         <div className="p-1 bg-slate-700 text-white rounded-sm shadow-sm">
                            <Building className="w-4 h-4" />
                         </div>
                         <span className="font-bold text-slate-800 text-base uppercase tracking-wider">
                            {parentName}
                         </span>
                       </div>
                     </TableCell>
                   </TableRow>

                   {/* Loop Level 2: Child (Phòng) */}
                   {children.map(([childName, unitUsers]) => (
                     <Fragment key={`child-${parentName}-${childName}`}>
                        
                        {/* --- LEVEL 2 HEADER (PHÒNG) --- */}
                        <TableRow className="bg-blue-50/60 hover:bg-blue-50 border-b border-blue-100/50">
                          <TableCell colSpan={5} className="py-2.5 pl-4">
                             <div className="flex items-center gap-2 ml-6 border-l-4 border-blue-500 pl-3">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span className="font-bold text-blue-900 text-[15px]">
                                   {childName}
                                </span>
                                <Badge variant="outline" className="ml-2 bg-white text-blue-600 border-blue-200 text-[10px] h-5 px-2 font-mono">
                                   {unitUsers.length}
                                </Badge>
                             </div>
                          </TableCell>
                        </TableRow>

                        {/* --- LEVEL 3: USERS --- */}
                        {unitUsers.map((user) => (
                           <TableRow key={user.userId} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                             <TableCell className="font-medium text-gray-400 text-xs pl-12 py-3">
                                <div className="flex items-center">
                                    <CornerDownRight className="w-3.5 h-3.5 mr-2 text-gray-300" />
                                    #{user.userId}
                                </div>
                             </TableCell>
                             
                             <TableCell className="py-3">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className={`font-semibold text-sm ${user.status ? "text-gray-900" : "text-gray-400 line-through"}`}>
                                          {user.fullName}
                                      </span>
                                      {!user.status && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border">Nghỉ</span>
                                      )}
                                  </div>
                                  <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                             </TableCell>

                             <TableCell className="py-3">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center">
                                      <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 shadow-sm text-[11px] font-normal">
                                          {USER_ROLE_LABELS[user.role]}
                                      </Badge>
                                   </div>
                                   <div className="flex items-center text-xs text-gray-500">
                                      <Briefcase className="w-3 h-3 mr-1 opacity-70" />
                                      {user.jobTitle || "---"}
                                   </div>
                                </div>
                             </TableCell>

                             <TableCell className="py-3">
                                <div className="flex items-center text-xs font-medium text-gray-700 bg-gray-50 w-fit px-2 py-1 rounded border border-gray-100">
                                   <ShieldAlert className={`w-3.5 h-3.5 mr-1.5 ${
                                      user.securityClearance >= 3 ? "text-red-500" : "text-blue-500"
                                   }`} />
                                   {SECURITY_LEVEL_LABELS[user.securityClearance]}
                                </div>
                             </TableCell>

                             <TableCell className="text-right pr-4 py-3">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 hover:text-blue-600 hover:bg-blue-100">
                                      <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.userId)} className="h-8 w-8 hover:text-red-600 hover:bg-red-100">
                                      <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                             </TableCell>
                           </TableRow>
                        ))}
                     </Fragment>
                   ))}
                 </Fragment>
               ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} userToEdit={editingUser} onSuccess={fetchUsers} />
      <DeleteUserAlert userId={deletingUserId} onClose={() => setDeletingUserId(null)} onSuccess={fetchUsers} />
    </div>
  );
};