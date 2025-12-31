import { UserTableWidget } from "@/widgets/user-list";

const UsersPage = () => {
  return (
    // Container chính của trang
    <div className="flex flex-col h-full bg-gray-50/50 p-6">
      {/* Trong UserTableWidget đã có sẵn Header (Toolbar) và Table.
        Page này chỉ cần bọc padding và background cho đẹp.
      */}
      <UserTableWidget />
    </div>
  );
};

export default UsersPage;