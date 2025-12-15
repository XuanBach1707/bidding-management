import AuthGuard from "@/features/auth/ui/auth-guard";
import { Sidebar } from "@/widgets/layout/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {/* 1. CONTAINER CHA: Dùng Flex để dàn 2 cột ngang */}
      {/* h-screen: Chiều cao bằng đúng màn hình */}
      {/* overflow-hidden: Chặn thanh cuộn của cả trang (để cuộn riêng từng vùng) */}
      <div className="flex h-screen w-full overflow-hidden bg-gray-100">
        
        {/* 2. CỘT TRÁI (SIDEBAR WRAPPER) */}
        {/* w-[250px]: Chiều rộng cố định */}
        {/* flex-shrink-0: Không cho phép bị co lại khi màn hình nhỏ */}
        {/* border-r: Tạo đường kẻ ngăn cách */}
        <aside className="w-[250px] flex-shrink-0 border-r bg-white">
           {/* Sidebar của bạn nằm gọn trong này */}
           <Sidebar />
        </aside>

        {/* 3. CỘT PHẢI (MAIN CONTENT) */}
        {/* flex-1: Chiếm toàn bộ khoảng trắng còn lại */}
        {/* overflow-y-auto: Nếu nội dung dài, thanh cuộn sẽ hiện Ở ĐÂY chứ không hiện ở body */}
        <main className="flex-1 overflow-y-auto">
           {/* Padding nội dung */}
           <div className="p-8">
               {children}
           </div>
        </main>
        
      </div>
    </AuthGuard>
  );
}