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
  ShieldCheck,
  type LucideIcon 
} from "lucide-react";

export interface SidebarRoute {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles?: string[]; // Mảng chứa các role được phép xem
  children?: SidebarRoute[];
}

export const sidebarRoutes: SidebarRoute[] = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "BID_MANAGER", "SPECIALIST", "ENGINEER", "JKAN"],
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
        icon: CheckSquare,
        // Chặn MANAGER và BID_MANAGER nhìn thấy mục này
        roles: ["ADMIN", "SPECIALIST", "ENGINEER", "JKAN"] 
      },
      { 
        title: "Nhiệm vụ dự án", 
        href: "/task-allocation",
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
    title: "Phân quyền (ABAC)", 
    icon: ShieldCheck,
    href: "/abac-config",
    roles: ["ADMIN"],
  },
  {
    title: "Hệ thống",
    icon: Settings,
    href: "/settings",
    roles: ["ADMIN"],
  },
];