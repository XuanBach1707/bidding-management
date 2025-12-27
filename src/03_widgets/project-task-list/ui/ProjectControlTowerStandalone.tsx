import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Send,
  MoreHorizontal,
  BellRing,
  Eye,
  Download
} from 'lucide-react';

// --- CÁC COMPONENT UI TỰ CHẾ (Thay thế cho thư viện bên ngoài để chạy độc lập) ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'primary', size = 'default', className = "", onClick, ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-700",
  };
  const sizes: any = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    icon: "h-9 w-9",
  };
  return (
    <button 
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.default} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Progress = ({ value = 0, className = "" }: { value?: number, className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
    <div className="h-full bg-blue-600 transition-all duration-500 ease-in-out" style={{ width: `${value}%` }} />
  </div>
);

const Avatar = ({ children, className = "" }: any) => (
  <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarFallback = ({ children, className = "" }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600 font-bold ${className}`}>{children}</div>
);

const Input = ({ className = "", ...props }: any) => (
  <input 
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
    {...props} 
  />
);

// --- MOCK DATA TYPES ---
type TaskStatus = 'pending' | 'in-progress' | 'review' | 'done' | 'overdue';

interface Task {
  id: string;
  name: string;
  assignee: string;
  assigneeAvatar?: string;
  status: TaskStatus;
  progress: number;
  dueDate: string;
  hasFile?: boolean;
}

interface Package {
  id: string;
  name: string;
  department: string;
  status: TaskStatus;
  progress: number;
  tasks: Task[];
  isAuto?: boolean;
}

// --- MOCK DATA ---
const INITIAL_PACKAGES: Package[] = [
  {
    id: 'PKG-01',
    name: 'Hồ sơ Pháp lý & Năng lực Công ty',
    department: 'Phòng Hành chính',
    status: 'done',
    progress: 100,
    isAuto: true,
    tasks: [
      { id: 'T1', name: 'Đăng ký kinh doanh (Mới nhất)', assignee: 'System', status: 'done', progress: 100, dueDate: '2024-05-20', hasFile: true },
      { id: 'T2', name: 'Báo cáo tài chính 3 năm', assignee: 'System', status: 'done', progress: 100, dueDate: '2024-05-20', hasFile: true },
    ]
  },
  {
    id: 'PKG-02',
    name: 'Hồ sơ Nhân sự chủ chốt',
    department: 'Phòng Nhân sự',
    status: 'overdue',
    progress: 45,
    tasks: [
      { id: 'T3', name: 'Bằng cấp chỉ huy trưởng (Ông A)', assignee: 'Nguyễn Văn B', assigneeAvatar: 'NB', status: 'done', progress: 100, dueDate: '2024-05-21', hasFile: true },
      { id: 'T4', name: 'Chứng chỉ hành nghề giám sát', assignee: 'Trần Thị C', assigneeAvatar: 'TC', status: 'overdue', progress: 0, dueDate: '2024-05-22' },
      { id: 'T5', name: 'Hợp đồng lao động tổ đội', assignee: 'Nguyễn Văn B', assigneeAvatar: 'NB', status: 'in-progress', progress: 30, dueDate: '2024-05-24' },
    ]
  },
  {
    id: 'PKG-03',
    name: 'Biện pháp Thi công & Kỹ thuật',
    department: 'Phòng Kỹ thuật',
    status: 'in-progress',
    progress: 60,
    tasks: [
      { id: 'T6', name: 'Thuyết minh biện pháp móng', assignee: 'Lê Kỹ Sư', assigneeAvatar: 'LS', status: 'review', progress: 90, dueDate: '2024-05-25', hasFile: true },
      { id: 'T7', name: 'Bản vẽ tổ chức mặt bằng', assignee: 'Phạm Thiết Kế', assigneeAvatar: 'PK', status: 'in-progress', progress: 40, dueDate: '2024-05-26' },
    ]
  },
  {
    id: 'PKG-04',
    name: 'Đơn dự thầu & Bảo lãnh',
    department: 'Core Team (Đấu thầu)',
    status: 'in-progress',
    progress: 80,
    tasks: [
      { id: 'T8', name: 'Soạn thảo đơn dự thầu', assignee: 'PM (Tôi)', assigneeAvatar: 'ME', status: 'done', progress: 100, dueDate: '2024-05-23', hasFile: true },
      { id: 'T9', name: 'Liên hệ ngân hàng lấy bảo lãnh', assignee: 'Trợ lý PM', assigneeAvatar: 'TL', status: 'in-progress', progress: 60, dueDate: '2024-05-24' },
    ]
  }
];

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const styles = {
    'pending': 'bg-gray-100 text-gray-600 border-gray-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'review': 'bg-purple-50 text-purple-700 border-purple-200',
    'done': 'bg-green-50 text-green-700 border-green-200',
    'overdue': 'bg-red-50 text-red-700 border-red-200',
  };
  const labels = {
    'pending': 'Chờ xử lý',
    'in-progress': 'Đang làm',
    'review': 'Chờ duyệt',
    'done': 'Hoàn thành',
    'overdue': 'Trễ hạn',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- MAIN COMPONENT ---

export default function ProjectControlTower() {
  const [expandedPkgs, setExpandedPkgs] = useState<string[]>(['PKG-02']);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('activity'); // 'files' | 'activity' | 'history'

  const toggleExpand = (id: string) => {
    setExpandedPkgs(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
    setActiveTab(task.hasFile ? 'files' : 'activity');
  };

  return (
    <div className="flex h-[calc(100vh-20px)] bg-gray-50 w-full overflow-hidden text-slate-900">
      
      {/* LEFT AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isPanelOpen ? 'mr-[400px]' : ''}`}>
        
        {/* 1. DASHBOARD HEADER */}
        <div className="p-6 border-b bg-white space-y-4 shadow-sm z-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">KĐT Mới An Hưng - Gói thầu XL05</h1>
                    <p className="text-sm text-gray-500 mt-1">Mã dự án: P-2024-005 • Chủ đầu tư: TechCorp</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4"/> Xuất báo cáo
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <CheckCircle2 className="w-4 h-4"/> Tổng hợp hồ sơ & Nộp
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Thời gian còn lại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <span className="text-2xl font-bold text-gray-900">05 <span className="text-sm font-normal text-gray-500">ngày</span></span>
                        </div>
                        <Progress value={70} className="h-1 mt-3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Tiến độ tổng thể</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">68%</span>
                        </div>
                        <Progress value={68} className="h-1 mt-3" />
                    </CardContent>
                </Card>
                <Card className="col-span-2 border-red-200 bg-red-50">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Vấn đề cần xử lý
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-gray-800">• Phòng Nhân sự chưa nộp đủ chứng chỉ.</p>
                        <p className="text-sm text-gray-600 mt-1">• Phòng Kỹ thuật cần duyệt lại bản vẽ móng.</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* 2. TRACKING MATRIX */}
        <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border shadow-sm">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-sm text-gray-600">
                    <div className="col-span-5">Hạng mục công việc</div>
                    <div className="col-span-2">Phụ trách</div>
                    <div className="col-span-2">Hạn chót</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-1 text-center">Tác vụ</div>
                </div>

                {/* Package List */}
                {INITIAL_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="group border-b last:border-0">
                        {/* Level 1: Package Row */}
                        <div 
                            className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors hover:bg-gray-50 ${pkg.status === 'overdue' ? 'bg-red-50/50' : ''}`}
                            onClick={() => toggleExpand(pkg.id)}
                        >
                            <div className="col-span-5 flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-gray-400">
                                    {expandedPkgs.includes(pkg.id) ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                </Button>
                                <div>
                                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{width: `${pkg.progress}%`}}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{pkg.progress}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                {pkg.department}
                            </div>
                            <div className="col-span-2 text-sm text-gray-500">
                                {pkg.isAuto ? 'Tự động' : 'Theo từng task'}
                            </div>
                            <div className="col-span-2">
                                <StatusBadge status={pkg.status} />
                            </div>
                            <div className="col-span-1 flex justify-center">
                                {pkg.status === 'overdue' && (
                                    <Button size="sm" variant="destructive" className="h-7 text-xs px-2">
                                        <BellRing className="w-3 h-3 mr-1" /> Nhắc
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Level 2: Tasks List */}
                        {expandedPkgs.includes(pkg.id) && (
                            <div className="bg-gray-50 border-t border-gray-100">
                                {pkg.tasks.map((task) => (
                                    <div 
                                        key={task.id} 
                                        className="grid grid-cols-12 gap-4 py-3 px-4 pl-12 border-b last:border-0 border-gray-100 hover:bg-white text-sm items-center transition-colors"
                                    >
                                        <div className="col-span-5 flex items-center gap-3">
                                            {task.hasFile ? <FileText className="w-4 h-4 text-blue-500" /> : <Clock className="w-4 h-4 text-gray-300" />}
                                            <span 
                                                className="cursor-pointer hover:text-blue-600 hover:underline truncate font-medium text-gray-700"
                                                onClick={() => handleTaskClick(task)}
                                            >
                                                {task.name}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            {task.assigneeAvatar ? (
                                                <Avatar className="h-6 w-6 border border-white shadow-sm">
                                                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">{task.assigneeAvatar}</AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">🤖</div>
                                            )}
                                            <span className="text-gray-600 truncate">{task.assignee}</span>
                                        </div>
                                        <div className="col-span-2 text-gray-500">
                                            {task.dueDate}
                                        </div>
                                        <div className="col-span-2">
                                            <StatusBadge status={task.status} />
                                        </div>
                                        <div className="col-span-1 flex justify-center gap-1">
                                            {task.status === 'review' && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 hover:bg-green-50 text-green-700 px-2" onClick={() => handleTaskClick(task)}>
                                                    Duyệt
                                                </Button>
                                            )}
                                            {task.hasFile && task.status === 'done' && (
                                                 <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-500 hover:text-blue-600" onClick={() => handleTaskClick(task)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT AREA: DETAIL PANEL (SLIDING DRAWER) */}
      <div 
        className={`fixed inset-y-0 right-0 w-[400px] bg-white border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTask ? (
            <>
                <div className="p-4 border-b flex justify-between items-start bg-gray-50">
                    <div className="flex-1 mr-2">
                        <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">{selectedTask.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={selectedTask.status} />
                            <span className="text-xs text-gray-500">Hạn: {selectedTask.dueDate}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Custom Tabs */}
                <div className="flex border-b">
                    <button 
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('files')}
                    >
                        Tài liệu
                    </button>
                    <button 
                         className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Trao đổi
                    </button>
                     <button 
                         className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Lịch sử
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                    
                    {/* FILES TAB CONTENT */}
                    {activeTab === 'files' && (
                        <div className="space-y-4 fade-in">
                            {selectedTask.hasFile ? (
                                <Card className="border-blue-200 bg-blue-50">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border shadow-sm shrink-0">
                                            <FileText className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate text-blue-900">TM_Bien_Phap_Mong_v2.pdf</p>
                                            <p className="text-xs text-blue-700 opacity-70">2.4 MB • 2 giờ trước</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="shrink-0 hover:bg-blue-100 rounded-full">
                                            <Download className="w-4 h-4 text-blue-600" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="text-center py-10 text-gray-500 text-sm border-2 border-dashed rounded-lg bg-white">
                                    Chưa có tài liệu nào được tải lên
                                </div>
                            )}
                            
                            {selectedTask.status === 'review' && (
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">Yêu cầu sửa</Button>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Duyệt ngay</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTIVITY TAB CONTENT */}
                    {activeTab === 'activity' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 space-y-4 pb-4">
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-700">PM</AvatarFallback></Avatar>
                                    <div className="bg-white border p-3 rounded-lg text-sm rounded-tl-none shadow-sm">
                                        <p className="font-semibold text-xs mb-1 text-gray-900">PM (Tôi)</p>
                                        <p className="text-gray-700">@Lê Kỹ Sư Chú ý cập nhật theo tiêu chuẩn mới nhé em.</p>
                                    </div>
                                </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-indigo-100 text-indigo-700">LS</AvatarFallback></Avatar>
                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-sm rounded-tr-none shadow-sm">
                                        <p className="font-semibold text-xs mb-1 text-right text-indigo-900">Lê Kỹ Sư</p>
                                        <p className="text-indigo-800">Dạ em đã update trong bản v2 rồi ạ.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 border-t mt-auto flex gap-2">
                                <Input placeholder="Nhập tin nhắn..." className="h-10 bg-white" />
                                <Button size="icon" className="h-10 w-10 shrink-0 bg-blue-600 text-white hover:bg-blue-700"><Send className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    )}
                    
                    {/* HISTORY TAB CONTENT */}
                    {activeTab === 'history' && (
                         <div className="space-y-6 relative pl-4 border-l-2 border-gray-200 ml-2 py-2">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100"></div>
                                <p className="text-sm font-medium text-gray-900">Đã tải lên file v2</p>
                                <p className="text-xs text-gray-500 mt-0.5">Lê Kỹ Sư • 10:30 AM</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 border-2 border-white"></div>
                                <p className="text-sm font-medium text-gray-900">Nhận việc</p>
                                <p className="text-xs text-gray-500 mt-0.5">Lê Kỹ Sư • 08:00 AM</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 border-2 border-white"></div>
                                <p className="text-sm font-medium text-gray-900">PM giao việc</p>
                                <p className="text-xs text-gray-500 mt-0.5">Hệ thống • 07:55 AM</p>
                            </div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-gray-50/50">
                <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <MoreHorizontal className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Chọn một công việc để xem chi tiết</p>
            </div>
        )}
      </div>
    </div>
  );
}