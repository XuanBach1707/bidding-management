import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Database, 
  // Settings, 
  Users, 
  Bot,
  // Filter,
  History,
  CheckSquare,
  PlayCircle,
  ShieldCheck,
  // UserCog,
  FolderClock, 
  ClipboardCheck,
  PieChart, 
  FolderOpen,
  Sparkles, // [MỚI] Icon cho Trợ lý AI
  type LucideIcon 
} from "lucide-react";

export interface SidebarRoute {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles?: string[]; 
  children?: SidebarRoute[];
}

const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",          
  BID_MANAGER: "BID_MANAGER",  
  SPECIALIST: "SPECIALIST",    
  ENGINEER: "ENGINEER",        
  JKAN: "JKAN",                
};

export const sidebarRoutes: SidebarRoute[] = [
  // 1. TỔNG QUAN
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

  // 2. CƠ HỘI ĐẤU THẦU
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
      { 
        title: "Cấu hình Bot", 
        href: "/bot-config", 
        icon: Bot,
        roles: [ROLES.ADMIN] 
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
      },
      { 
        title: "Nhiệm vụ của tôi", 
        href: "/my-tasks",
        icon: CheckSquare,
        roles: [
            ROLES.ENGINEER, 
            ROLES.JKAN
        ] 
      },
      { 
        title: "Duyệt bài", 
        href: "/reviews",
        icon: ClipboardCheck,
        roles: [ROLES.ADMIN, ROLES.BID_MANAGER, ROLES.SPECIALIST] 
      },
      { 
        title: "Nhiệm vụ dự án", 
        href: "/task-allocation",
        icon: History,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.BID_MANAGER, ROLES.SPECIALIST] 
      },
    ],
  },

  // 4. KHO TÀI NGUYÊN
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

  // 5. QUẢN TRỊ NGƯỜI DÙNG
  {
    title: "Quản trị người dùng",
    href: "/users",
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },

  // 6. CẤU HÌNH HỆ THỐNG
  {
    title: "Phân quyền (ABAC)", 
    icon: ShieldCheck,
    href: "/abac-config",
    roles: [ROLES.ADMIN],
  },

  // 7. TRỢ LÝ AI (MỚI)
  {
    title: "Trợ lý AI",
    icon: Sparkles, // Dùng icon lấp lánh cho AI
    href: "/bidding-assistant", // Đường dẫn khớp với Page đã tạo
    roles: [
      ROLES.ADMIN, 
      ROLES.MANAGER, 
      ROLES.BID_MANAGER, 
      ROLES.SPECIALIST, 
      ROLES.ENGINEER, 
      ROLES.JKAN
    ], // Full quyền
  },
];