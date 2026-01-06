import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Database, 
  Settings, 
  FileText,
  Users, // Có thể bỏ nếu không dùng nữa, hoặc cứ để đó
  Truck, // Có thể bỏ
  Scale, // Có thể bỏ
  Landmark, // Có thể bỏ
  Bot,
  Filter,
  History,
  CheckSquare,
  PlayCircle,
  ShieldCheck,
  UserCog,
  FolderClock, 
  ClipboardCheck,
  // [MỚI] Thêm icon cho 3 menu mới
  PieChart, 
  FolderOpen,
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
        // Chỉ ENGINEER và JKAN (Người làm) mới thấy
        roles: ["ADMIN", "ENGINEER", "JKAN"] 
      },
      // --- KHU VỰC QUẢN LÝ / REVIEWER ---
      { 
        title: "Duyệt bài", 
        href: "/reviews",
        icon: ClipboardCheck,
        // Chỉ SPECIALIST (Người duyệt) mới thấy
        roles: ["ADMIN", "SPECIALIST"] 
      },
      { 
        title: "Nhiệm vụ dự án", 
        href: "/task-allocation",
        icon: History 
      },
    ],
  },
  // [CẬP NHẬT] Module Kho Tài nguyên theo cấu trúc FSD mới
  {
    title: "Kho Tài nguyên",
    icon: Database,
    children: [
      { 
        title: "Tổng quan tài nguyên", 
        href: "/resources/overview", // Trỏ vào Page 1
        icon: PieChart 
      },
      { 
        title: "Kho tài liệu chung", 
        href: "/resources/repository", // Trỏ vào Page 2 (Chứa Grid Folder & List File)
        icon: FolderOpen 
      },
      { 
        title: "Lịch sử lưu trữ", 
        href: "/resources/history", // Trỏ vào Page 3 (Dropdown năm)
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