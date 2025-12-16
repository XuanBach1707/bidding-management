// src/03_widgets/layout/config/sidebar-routes.ts
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
  Bot,         // Thêm icon Bot
  Filter,      // Thêm icon Filter
  History,     // Thêm icon History
  CheckSquare, // Thêm icon Task
  PlayCircle,  // Thêm icon Active
  type LucideIcon 
} from "lucide-react";

// 1. Định nghĩa Type cho Route (để dùng được ở sidebar.tsx)
export interface SidebarRoute {
  title: string;
  href?: string;       // Có thể null nếu là menu cha
  icon?: LucideIcon;   // Có thể null nếu không muốn hiện icon ở menu con
  roles?: string[];    // Mảng các role được phép xem
  children?: SidebarRoute[]; // Đệ quy menu con
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
        icon: Filter // Đã đổi icon cho hợp ngữ cảnh
      },
      { 
        title: "Cấu hình Bot", 
        href: "/bot-config", 
        icon: Bot,   // Đã đổi icon cho hợp ngữ cảnh
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
        href: "/projects/active",
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
  {
    title: "Hệ thống",
    icon: Settings,
    href: "/settings",
    roles: ["ADMIN"],
  },
];