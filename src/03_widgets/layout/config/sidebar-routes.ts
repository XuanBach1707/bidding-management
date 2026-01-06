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
  UserCog,
  FolderClock, 
  ClipboardCheck, // [MỚI] Icon cho mục Duyệt bài
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
      // --- KHU VỰC NHÂN VIÊN ---
      { 
        title: "Nhiệm vụ của tôi", 
        href: "/my-tasks",
        icon: CheckSquare,
        // [CẬP NHẬT] Chỉ ENGINEER và JKAN (Người làm) mới thấy
        // Đã xóa SPECIALIST khỏi đây
        roles: ["ADMIN", "ENGINEER", "JKAN"] 
      },
      // --- KHU VỰC QUẢN LÝ / REVIEWER ---
      { 
        title: "Duyệt bài", 
        href: "/reviews",
        icon: ClipboardCheck, // Icon phù hợp cho việc Review
        // [MỚI] Chỉ SPECIALIST (Người duyệt) mới thấy
        roles: ["ADMIN", "SPECIALIST"] 
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
      { 
        title: "Kho dữ liệu thầu", 
        href: "/bidding-history", 
        icon: FolderClock 
      },
    ],
  },
  {
    title: "Quản trị người dùng",
    href: "/users",
    icon: UserCog,
    roles: ["ADMIN", "MANAGER"],
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