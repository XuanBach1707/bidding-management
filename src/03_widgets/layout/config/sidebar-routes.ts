import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Database, 
  Settings, 
  FileText,
  Users,
  Truck,
  Scale,
  Landmark,
  Bot,
  Filter,
  History,
  CheckSquare,
  PlayCircle,
  ShieldCheck, // <--- 1. Thêm icon Khiên bảo mật
  type LucideIcon 
} from "lucide-react";

// 1. Định nghĩa Type cho Route (Giữ nguyên)
export interface SidebarRoute {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles?: string[];
  children?: SidebarRoute[];
}

// 2. Cấu hình danh sách Menu
export const sidebarRoutes: SidebarRoute[] = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    title: "Cơ hội đấu thầu",
    icon: Search,
    children: [
      { 
        title: "Tra cứu gói thầu", 
        href: "/opportunities", 
        icon: Search 
      },
      { 
        title: "Phân tích & Sàng lọc", 
        href: "/opportunities/analysis", 
        icon: Filter 
      },
      { 
        title: "Cấu hình Bot", 
        href: "/bot-config", 
        icon: Bot,
        roles: ["ADMIN"] 
      },
    ],
  },
  {
    title: "Quản lý Dự án",
    icon: Briefcase,
    children: [
      { 
        title: "Dự án đang chạy", 
        href: "/bidding-projects-list",
        icon: PlayCircle 
      },
      { 
        title: "Nhiệm vụ của tôi", 
        href: "/my-tasks",
        icon: CheckSquare 
      },
      { 
        title: "Lịch sử & Kết quả", 
        href: "/projects/history",
        icon: History 
      },
    ],
  },
  {
    title: "Kho Tài nguyên",
    icon: Database,
    children: [
      { title: "Hồ sơ Nhân sự", href: "/resources/human", icon: Users },
      { title: "Máy móc thiết bị", href: "/resources/equipment", icon: Truck },
      { title: "Hồ sơ Pháp lý", href: "/resources/legal", icon: Scale },
      { title: "Hồ sơ Tài chính", href: "/resources/finance", icon: Landmark },
      { title: "Hợp đồng tương tự", href: "/resources/contracts", icon: FileText },
    ],
  },
  
  // --- MỚI THÊM: ABAC MODULE ---
  // Tôi để nó gần Settings vì đây là tính năng quản trị hệ thống
  {
    title: "Phân quyền (ABAC)", 
    icon: ShieldCheck,       // Icon cái khiên
    href: "/abac-config",    // Đường dẫn trỏ tới page chúng ta vừa làm
    roles: ["ADMIN"],        // Chỉ Admin mới thấy
  },

  {
    title: "Hệ thống",
    icon: Settings,
    href: "/settings",
    roles: ["ADMIN"],
  },
];