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
import { Edit, Trash2, UserPlus, ShieldAlert, Briefcase, Building2, Building, CornerDownRight, Users, MoreHorizontal } from "lucide-react";
import { UserFormDialog, DeleteUserAlert } from "@/features/manage-user";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"; // Cần thêm cái này cho mobile action gọn hơn

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
      const priorityName = "Khối Đảm bảo Kinh doanh"; 

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
    <div className="space-y-4 md:space-y-6">
      
      {/* 1. TOOLBAR: Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-[#009d98]/10 rounded-xl shrink-0">
              <Users className="w-6 h-6 text-[#009d98]" />
           </div>
           <div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Nhân sự</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-1">Danh sách tài khoản & phân quyền.</p>
           </div>
        </div>
        <Button onClick={handleCreate} className="w-full md:w-auto bg-[#009d98] hover:bg-[#008580] text-white shadow-sm font-semibold h-10">
           <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân sự
        </Button>
      </div>

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
           <p className="text-slate-400 animate-pulse">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
           <p className="text-slate-400">Chưa có nhân sự nào.</p>
        </div>
      )}

      {/* 3. DESKTOP VIEW: TABLE (Chỉ hiện trên md trở lên) */}
      {!loading && users.length > 0 && (
        <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                {groupedStructure.map(({ parentName, children }) => (
                  <Fragment key={`desktop-parent-${parentName}`}>
                    {/* LEVEL 1 */}
                    <TableRow className="bg-slate-100 hover:bg-slate-100 border-b border-white">
                      <TableCell colSpan={5} className="py-3 pl-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-slate-600 text-white rounded shadow-sm"><Building className="w-4 h-4" /></div>
                          <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">{parentName}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* LEVEL 2 */}
                    {children.map(([childName, unitUsers]) => (
                      <Fragment key={`desktop-child-${parentName}-${childName}`}>
                         <TableRow className="bg-blue-50/40 hover:bg-blue-50/60 border-b border-blue-50">
                           <TableCell colSpan={5} className="py-2 pl-6">
                              <div className="flex items-center gap-2 ml-4 border-l-2 border-blue-400 pl-3 py-0.5">
                                 <Building2 className="w-4 h-4 text-blue-500" />
                                 <span className="font-bold text-blue-800 text-sm">{childName}</span>
                                 <Badge variant="secondary" className="ml-2 bg-white text-blue-600 border border-blue-100 text-[10px] h-5 px-1.5">{unitUsers.length}</Badge>
                              </div>
                           </TableCell>
                         </TableRow>
                         {/* LEVEL 3: USERS */}
                         {unitUsers.map((user) => (
                            <TableRow key={user.userId} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                              <TableCell className="font-medium text-slate-400 text-xs pl-12 py-3">
                                 <div className="flex items-center">
                                     <CornerDownRight className="w-3.5 h-3.5 mr-2 text-slate-300" /> #{user.userId}
                                 </div>
                              </TableCell>
                              <TableCell className="py-3">
                                 <div className="flex items-center gap-3">
                                     <Avatar className="h-9 w-9 border border-slate-100 bg-slate-50 text-slate-500">
                                         <AvatarFallback className="font-bold text-xs">{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                                     </Avatar>
                                     <div className="flex flex-col">
                                         <div className="flex items-center gap-2">
                                             <span className={`font-semibold text-sm ${user.status ? "text-slate-800" : "text-slate-400 line-through"}`}>{user.fullName}</span>
                                             {!user.status && <Badge variant="outline" className="text-[10px] h-4 px-1 bg-slate-100 text-slate-500 border-slate-200">Nghỉ</Badge>}
                                         </div>
                                         <span className="text-xs text-slate-500 max-w-[200px] truncate" title={user.email}>{user.email}</span>
                                     </div>
                                 </div>
                              </TableCell>
                              <TableCell className="py-3">
                                 <div className="flex flex-col gap-1.5 items-start">
                                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 shadow-sm text-[11px] font-medium h-5">
                                      {USER_ROLE_LABELS[user.role]}
                                    </Badge>
                                    <div className="flex items-center text-xs text-slate-500">
                                       <Briefcase className="w-3 h-3 mr-1.5 opacity-70" /> {user.jobTitle || "---"}
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="py-3">
                                 <div className={`flex items-center text-xs font-medium px-2 py-1 rounded border w-fit ${user.securityClearance >= 3 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> {SECURITY_LEVEL_LABELS[user.securityClearance]}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right pr-6 py-3">
                                 {/* Sửa: Bỏ group-hover opacity để dễ click hơn hoặc giữ nguyên tùy ý desktop */}
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
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. MOBILE VIEW: CARD LIST (Chỉ hiện trên mobile, ẩn trên md) */}
      {!loading && users.length > 0 && (
        <div className="md:hidden space-y-6">
          {groupedStructure.map(({ parentName, children }) => (
            <div key={`mobile-parent-${parentName}`} className="space-y-3">
              
              {/* Sticky Header cho Tên Khối để dễ theo dõi khi cuộn */}
              <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur py-2 px-3 border-y border-slate-200 shadow-sm flex items-center gap-2">
                 <Building className="w-4 h-4 text-slate-600" />
                 <span className="font-bold text-slate-800 text-sm uppercase">{parentName}</span>
              </div>

              {children.map(([childName, unitUsers]) => (
                <div key={`mobile-child-${childName}`} className="px-1 space-y-3">
                   {/* Tên Phòng */}
                   <div className="flex items-center gap-2 pl-2 border-l-2 border-blue-400">
                      <span className="font-bold text-blue-800 text-sm">{childName}</span>
                      <span className="text-xs text-slate-400">({unitUsers.length})</span>
                   </div>

                   {/* Danh sách User dạng Card */}
                   <div className="grid grid-cols-1 gap-3">
                     {unitUsers.map(user => (
                       <div key={user.userId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative">
                          {/* Header Card */}
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-100">
                                   <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                   <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                      {user.fullName}
                                      {!user.status && <span className="text-[10px] text-red-500 border border-red-200 bg-red-50 px-1 rounded">Nghỉ</span>}
                                   </div>
                                   <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                             </div>
                             
                             {/* Mobile Actions: Dùng DropdownMenu thay vì Hover */}
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                                   <MoreHorizontal className="w-5 h-5" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={() => handleEdit(user)}>
                                   <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleDelete(user.userId)} className="text-red-600 focus:text-red-600">
                                   <Trash2 className="w-4 h-4 mr-2" /> Xóa nhân sự
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Info Body */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                             <div className="space-y-1">
                                <span className="text-slate-400 block">Vai trò</span>
                                <Badge variant="secondary" className="font-normal">{USER_ROLE_LABELS[user.role]}</Badge>
                             </div>
                             <div className="space-y-1">
                                <span className="text-slate-400 block">Chức vụ</span>
                                <span className="font-medium text-slate-700 block">{user.jobTitle || "---"}</span>
                             </div>
                             <div className="col-span-2 mt-1">
                                <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded border w-full justify-center ${
                                   user.securityClearance >= 3 ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                                }`}>
                                   <ShieldAlert className="w-3.5 h-3.5" />
                                   <span className="font-medium">Bảo mật: {SECURITY_LEVEL_LABELS[user.securityClearance]}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <UserFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} userToEdit={editingUser} onSuccess={fetchUsers} />
      <DeleteUserAlert userId={deletingUserId} onClose={() => setDeletingUserId(null)} onSuccess={fetchUsers} />
    </div>
  );
};