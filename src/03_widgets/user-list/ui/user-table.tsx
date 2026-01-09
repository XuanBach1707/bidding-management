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
import { Edit, Trash2, UserPlus, ShieldAlert, Briefcase, Building2, Building, ChevronRight, CornerDownRight, Users } from "lucide-react";
import { UserFormDialog, DeleteUserAlert } from "@/features/manage-user";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

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

    const sortedParents = Object.entries(hierarchy).sort((a, b) => {
      const nameA = a[0];
      const nameB = b[0];
      const priorityName = "Khối Đảm bảo Kinh doanh"; // Priority

      if (nameA === priorityName) return -1;
      if (nameB === priorityName) return 1;
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
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-[#009d98]/10 rounded-xl">
              <Users className="w-6 h-6 text-[#009d98]" />
           </div>
           <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Nhân sự</h2>
              <p className="text-sm text-slate-500 font-medium">Danh sách tài khoản và phân quyền hệ thống.</p>
           </div>
        </div>
        <Button onClick={handleCreate} className="bg-[#009d98] hover:bg-[#008580] text-white shadow-sm font-semibold">
           <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân sự
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="w-[80px] pl-6 font-bold text-slate-700">ID</TableHead>
              <TableHead className="font-bold text-slate-700">Họ và tên / Email</TableHead>
              <TableHead className="font-bold text-slate-700">Vai trò & Chức vụ</TableHead>
              <TableHead className="font-bold text-slate-700">Bảo mật</TableHead>
              <TableHead className="text-right pr-6 font-bold text-slate-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-32 text-slate-400">Đang tải dữ liệu...</TableCell></TableRow>
            ) : users.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center h-32 text-slate-400">Chưa có nhân sự nào.</TableCell></TableRow>
            ) : (
               groupedStructure.map(({ parentName, children }) => (
                 <Fragment key={`parent-${parentName}`}>
                   
                   {/* LEVEL 1: BAN/KHỐI (Darker bg) */}
                   <TableRow className="bg-slate-100 hover:bg-slate-100 border-b border-white">
                     <TableCell colSpan={5} className="py-3 pl-6">
                       <div className="flex items-center gap-2">
                         <div className="p-1 bg-slate-600 text-white rounded shadow-sm">
                            <Building className="w-4 h-4" />
                         </div>
                         <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                           {parentName}
                         </span>
                       </div>
                     </TableCell>
                   </TableRow>

                   {/* LEVEL 2: PHÒNG (Lighter bg) */}
                   {children.map(([childName, unitUsers]) => (
                     <Fragment key={`child-${parentName}-${childName}`}>
                        <TableRow className="bg-blue-50/40 hover:bg-blue-50/60 border-b border-blue-50">
                          <TableCell colSpan={5} className="py-2 pl-6">
                             <div className="flex items-center gap-2 ml-4 border-l-2 border-blue-400 pl-3 py-0.5">
                                <Building2 className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-blue-800 text-sm">
                                   {childName}
                                </span>
                                <Badge variant="secondary" className="ml-2 bg-white text-blue-600 border border-blue-100 text-[10px] h-5 px-1.5 font-mono shadow-sm">
                                   {unitUsers.length}
                                </Badge>
                             </div>
                          </TableCell>
                        </TableRow>

                        {/* LEVEL 3: USERS */}
                        {unitUsers.map((user) => (
                           <TableRow key={user.userId} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                             <TableCell className="font-medium text-slate-400 text-xs pl-12 py-3">
                                <div className="flex items-center">
                                    <CornerDownRight className="w-3.5 h-3.5 mr-2 text-slate-300" />
                                    #{user.userId}
                                </div>
                             </TableCell>
                             
                             <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-slate-100 bg-slate-50 text-slate-500">
                                        <AvatarFallback className="font-bold text-xs">{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm ${user.status ? "text-slate-800" : "text-slate-400 line-through"}`}>
                                                {user.fullName}
                                            </span>
                                            {!user.status && (
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-slate-100 text-slate-500 border-slate-200">Nghỉ</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500">{user.email}</span>
                                    </div>
                                </div>
                             </TableCell>

                             <TableCell className="py-3">
                                <div className="flex flex-col gap-1.5 items-start">
                                   <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 shadow-sm text-[11px] font-medium h-5">
                                       {USER_ROLE_LABELS[user.role]}
                                   </Badge>
                                   <div className="flex items-center text-xs text-slate-500">
                                      <Briefcase className="w-3 h-3 mr-1.5 opacity-70" />
                                      {user.jobTitle || "---"}
                                   </div>
                                </div>
                             </TableCell>

                             <TableCell className="py-3">
                                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded border w-fit ${
                                    user.securityClearance >= 3 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                }`}>
                                   <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                                   {SECURITY_LEVEL_LABELS[user.securityClearance]}
                                </div>
                             </TableCell>

                             <TableCell className="text-right pr-6 py-3">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 text-slate-400 hover:text-[#009d98] hover:bg-[#009d98]/10 rounded-lg">
                                      <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.userId)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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