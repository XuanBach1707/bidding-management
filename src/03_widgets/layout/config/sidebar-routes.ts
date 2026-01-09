import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Database, 
  Settings, 
  Users, 
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

// Định nghĩa Constant cho Role để tránh gõ sai (Typo)
const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",          // Giám đốc / Quản lý chung
  BID_MANAGER: "BID_MANAGER",  // Trưởng phòng thầu
  SPECIALIST: "SPECIALIST",    // Trưởng phòng chuyên môn (Cập nhật quyền quản lý)
  ENGINEER: "ENGINEER",        // Nhân viên kỹ thuật
  JKAN: "JKAN",                // Role mới (Ngang hàng Engineer)
};

export const sidebarRoutes: SidebarRoute[] = [
  // 1. TỔNG QUAN: Ai cũng được vào
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      ROLES.ADMIN, 
      ROLES.MANAGER, 
      ROLES.BID_MANAGER, 
      ROLES.SPECIALIST, 
      ROLES.ENGINEER, 
      ROLES.JKAN
    ],
  },

  // 2. CƠ HỘI ĐẤU THẦU: Chỉ dành cho cấp Quản lý & Admin
  // (Engineer và JKAN không cần thấy mục này để đỡ rối)
  {
    title: "Cơ hội đấu thầu",
    icon: Search,
    roles: [ROLES.ADMIN, ROLES.BID_MANAGER, ROLES.SPECIALIST, ROLES.MANAGER], 
    children: [
      { 
        title: "Tra cứu gói thầu", 
        href: "/opportunities", 
        icon: Search 
      },
      // { 
      //   title: "Phân tích & Sàng lọc", 
      //   href: "/opportunities/analysis", 
      //   icon: Filter 
      // },
      { 
        title: "Cấu hình Bot", 
        href: "/bot-config", 
        icon: Bot,
        roles: [ROLES.ADMIN] // Chỉ Admin chỉnh Bot
      },
    ],
  },

  // 3. QUẢN LÝ DỰ ÁN
  {
    title: "Quản lý Dự án",
    icon: Briefcase,
    roles: [
      ROLES.ADMIN, 
      ROLES.MANAGER, 
      ROLES.BID_MANAGER, 
      ROLES.SPECIALIST, 
      ROLES.ENGINEER, 
      ROLES.JKAN
    ],
    children: [
      { 
        title: "Dự án đang chạy", 
        href: "/bidding-projects-list",
        icon: PlayCircle,
        // Ai cũng xem được danh sách dự án
      },
      // --- KHU VỰC THỰC THI (NHÂN VIÊN) ---
      { 
        title: "Nhiệm vụ của tôi", 
        href: "/my-tasks",
        icon: CheckSquare,
        // Engineer, JKAN và cả Specialist (nếu trực tiếp làm) cần thấy
        roles: [
            ROLES.ENGINEER, 
            ROLES.JKAN
        ] 
      },
      // --- KHU VỰC QUẢN LÝ / DUYỆT BÀI ---
      { 
        title: "Duyệt bài", 
        href: "/reviews",
        icon: ClipboardCheck,
// Chỉ những người có thẩm quyền duyệt (Specialist, Bid Manager, Admin)
        roles: [ROLES.ADMIN, ROLES.BID_MANAGER, ROLES.SPECIALIST] 
      },
      { 
        title: "Nhiệm vụ dự án", 
        href: "/task-allocation",
        icon: History,
        // Chỉ cấp quản lý mới được vào phân công
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.BID_MANAGER, ROLES.SPECIALIST] 
      },
    ],
  },

  // 4. KHO TÀI NGUYÊN: Public cho toàn bộ nhân sự
  {
    title: "Kho Tài nguyên",
    icon: Database,
    roles: [
      ROLES.ADMIN, 
      ROLES.MANAGER, 
      ROLES.BID_MANAGER, 
      ROLES.SPECIALIST, 
      ROLES.ENGINEER, 
      ROLES.JKAN
    ],
    children: [
      { 
        title: "Tổng quan tài nguyên", 
        href: "/resources/overview", 
        icon: PieChart 
      },
      { 
        title: "Kho tài liệu chung", 
        href: "/resources/repository", 
        icon: FolderOpen 
      },
      { 
        title: "Lịch sử lưu trữ", 
        href: "/resources/history", 
        icon: FolderClock 
      },
    ],
  },

  // 5. QUẢN TRỊ NGƯỜI DÙNG: Admin và Giám đốc (Manager)
  {
    title: "Quản trị người dùng",
    href: "/users",
    icon: Users, // Dùng icon Users chuẩn hơn UserCog cho danh sách
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },

  // 6. CẤU HÌNH HỆ THỐNG: Chỉ Admin
  {
    title: "Phân quyền (ABAC)", 
    icon: ShieldCheck,
    href: "/abac-config",
    roles: [ROLES.ADMIN],
  },
  // {
  //   title: "Hệ thống",
  //   icon: Settings,
  //   href: "/settings",
  //   roles: [ROLES.ADMIN],
  // },
];