import { UserTableWidget } from "@/widgets/user-list";

const UsersPage = () => {
  return (
    // 1. Root: Nền xám nhẹ đồng bộ, Full chiều cao
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 2. Container: Giới hạn chiều rộng */}
      <div className="container mx-auto max-w-7xl p-6 md:p-8 flex-1 flex flex-col min-h-0">
         <UserTableWidget />
      </div>
    </div>
  );
};

export default UsersPage;