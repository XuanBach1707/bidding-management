import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { organizationApi, OrganizationUnit, UnitMember } from "@/entities/organization";
import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment } from "@/entities/task";
import { driveApi, DriveItem } from "@/entities/drive"; 
import { TempTask, FIXED_SECTIONS } from "./create-project.model";

interface UseCreateProjectProps {
  isOpen: boolean;
  hsmtId: number;
  defaultName: string;
  onClose: () => void;
}

export const useCreateProject = ({ isOpen, hsmtId, defaultName, onClose }: UseCreateProjectProps) => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(defaultName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý Ban và Cache Phòng
  const [boards, setBoards] = useState<OrganizationUnit[]>([]);
  const [departmentsCache, setDepartmentsCache] = useState<Record<number, OrganizationUnit[]>>({});
  
  const [tasks, setTasks] = useState<TempTask[]>([]);
  const [membersCache, setMembersCache] = useState<Record<number, UnitMember[]>>({});

  // --- HELPER: LOAD DEPARTMENTS ---
  const loadDepartments = async (boardId: number) => {
    if (departmentsCache[boardId]) return departmentsCache[boardId];
    try {
      const data = await organizationApi.getDepartments(boardId);
      setDepartmentsCache((prev) => ({ ...prev, [boardId]: data }));
      return data;
    } catch (error) {
      console.error(`Lỗi load phòng ban cho Board ${boardId}`, error);
      return [];
    }
  };

  // --- HELPER: LOAD MEMBERS ---
  const loadMembers = async (unitId: number) => {
    if (membersCache[unitId]) return;
    try {
      const data = await organizationApi.getUnitMembers(unitId);
      setMembersCache((prev) => ({ ...prev, [unitId]: data }));
    } catch (error) {
      console.error(`Lỗi load thành viên phòng ${unitId}`, error);
    }
  };

  // --- [UPDATE] LOGIC TỰ ĐỘNG LẤY FILE TỪ DRIVE (GỌI TUẦN TỰ) ---
  const fetchAutoDocuments = useCallback(async () => {
    try {
      // BƯỚC 1: Vào Root -> Tìm "KHO TÀI LIỆU"
      const rootRes = await driveApi.getRootProjects();
      const khoTaiLieu = rootRes.data.find(item => item.name === "KHO TÀI LIỆU" && item.type === "FOLDER");
      
      if (!khoTaiLieu) return;

      // BƯỚC 2: Vào KHO TÀI LIỆU -> Tìm folder con
      const subRes = await driveApi.getFolderDetail(khoTaiLieu.id);
      
      // Dùng trim() để xử lý tên có khoảng trắng thừa
      const legalFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ pháp lý" && item.type === "FOLDER");
      const financeFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ tài chính" && item.type === "FOLDER");

      const updates: Record<string, DriveItem[]> = {};
      let foundTargetFolders = false; // Cờ kiểm tra có tìm thấy folder đích không

      // BƯỚC 3: Lấy file chi tiết (GỌI LẦN LƯỢT - SEQUENTIAL)
      
      // 3.1. Lấy Hồ sơ pháp lý trước
      if (legalFolder) {
        foundTargetFolders = true;
        try {
           const res = await driveApi.getFolderDetail(legalFolder.id);
           updates["fixed_1"] = res.data.filter(i => i.type === "FILE");
        } catch (err) {
           console.error("Lỗi lấy hồ sơ pháp lý", err);
        }
      }

      // 3.2. Lấy Hồ sơ tài chính sau (đợi cái trên xong mới chạy)
      if (financeFolder) {
        foundTargetFolders = true;
        try {
           const res = await driveApi.getFolderDetail(financeFolder.id);
           updates["fixed_4"] = res.data.filter(i => i.type === "FILE");
        } catch (err) {
           console.error("Lỗi lấy hồ sơ tài chính", err);
        }
      }

      // --- LOGIC HIỂN THỊ TOAST ---
      const totalFilesFound = Object.values(updates).reduce((acc, files) => acc + files.length, 0);

      if (totalFilesFound > 0) {
        // Cập nhật State Tasks
        setTasks(prev => prev.map(t => {
          if (updates[t.id]) {
            return { ...t, files: updates[t.id] };
          }
          return t;
        }));
        
        toast({ 
          title: "Đồng bộ dữ liệu",
          description: `Đã tự động tải ${totalFilesFound} tài liệu từ Drive.` 
        });

      } else if (foundTargetFolders) {
        // Có folder nhưng rỗng
        toast({ 
            variant: "destructive",
            title: "Dữ liệu trống",
            description: "Không có file nào được tìm thấy trong thư mục Hồ sơ." 
        });
      }

    } catch (error) {
      console.error("Lỗi quy trình Drive:", error);
    }
  }, [toast]);

  // --- INIT DATA ---
  useEffect(() => {
    if (isOpen) {
      // 1. Load Boards
      organizationApi.getBoards().then((fetchedBoards) => {
        setBoards(fetchedBoards);

        // 2. Init Tasks
        const initialTasks: TempTask[] = FIXED_SECTIONS.map((s) => {
          const matchedBoard = fetchedBoards.find((b) =>
            s.keywords.some((k) => b.unitName.toLowerCase().includes(k.toLowerCase()))
          );

          const t: TempTask = {
            id: s.id,
            name: s.name,
            deadline: undefined,
            parentId: null,
            isFixed: true,
            selectedBoardId: matchedBoard ? matchedBoard.unitId : undefined,
            assignments: [],
            files: [],
          };
          
          if(t.selectedBoardId) loadDepartments(t.selectedBoardId);
          return t;
        });

        setTasks(initialTasks);
        
        // 3. Gọi hàm lấy file
        fetchAutoDocuments();

      }).catch(() => toast({ variant: "destructive", description: "Lỗi tải danh sách Ban" }));

      setProjectName(defaultName || "");
    }
  }, [isOpen, defaultName, toast, fetchAutoDocuments]);

  // --- ACTIONS ---
  const handleBoardChange = async (taskId: string, boardIdStr: string) => {
    const boardId = Number(boardIdStr);
    await loadDepartments(boardId);
    setTasks((prev) => prev.map((t) => {
        if (t.id === taskId) return { ...t, selectedBoardId: boardId, assignments: [], assigneeId: undefined };
        if (t.parentId === taskId) return { ...t, selectedBoardId: boardId, assignments: [], assigneeId: undefined };
        return t;
    }));
  };

  const handleDepartmentChange = (taskId: string, departmentIdStr: string) => {
    const deptId = Number(departmentIdStr);
    loadMembers(deptId);
    const newAssignment = {
      assignedUnitId: deptId,
      requiredRole: "SPECIALIST",
      requiredMinSecurity: 2,
      assignmentType: "MAIN",
      assignedUserId: 0,
      isAccepted: false,
    } as TaskAssignment;
    setTasks((prev) => {
      let newTasks = prev.map((t) => {
        if (t.id === taskId) return { ...t, assignments: [newAssignment], assigneeId: undefined };
        return t;
      });
      const isParent = FIXED_SECTIONS.some((s) => s.id === taskId);
      if (isParent) {
         newTasks = newTasks.map((t) => {
          if (t.parentId === taskId) return { ...t, assignments: [newAssignment], assigneeId: undefined };
          return t;
        });
      }
      return newTasks;
    });
  };

  const addSubTask = (parentId: string) => {
    const parentTask = tasks.find((t) => t.id === parentId);
    const newTask: TempTask = {
      id: `sub_${Date.now()}_${Math.random()}`,
      name: "",
      deadline: undefined,
      parentId: parentId,
      isFixed: false,
      selectedBoardId: parentTask?.selectedBoardId,
      assignments: parentTask ? [...parentTask.assignments] : [],
      assigneeId: undefined,
      files: [],
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, field: keyof TempTask, value: any) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!projectName.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập tên dự án" });
    try {
      setIsSubmitting(true);
      const projectRes = await biddingProjectApi.create({ name: projectName, status: "New", sourcePackageId: hsmtId });
      const newProjectId = projectRes.id;
      const parentMap: Record<string, number> = {};
      const parentTasks = tasks.filter((t) => t.isFixed);

      for (const p of parentTasks) {
        const res = await taskApi.create({
          taskName: p.name, biddingProjectId: newProjectId, deadline: p.deadline ? p.deadline.toISOString() : undefined,
          status: "OPEN", isMilestone: true, sourceType: "SYSTEM", parentTaskId: 0,
          assignments: p.assignments, assigneeId: p.assigneeId
        });
        parentMap[p.id] = res.id;
      }
      const subTasks = tasks.filter((t) => !t.isFixed && t.name.trim() !== "");
      for (const s of subTasks) {
        const realParentId = s.parentId ? parentMap[s.parentId] : 0;
        if (!realParentId) continue;
        await taskApi.create({
          taskName: s.name, biddingProjectId: newProjectId, deadline: s.deadline ? s.deadline.toISOString() : undefined,
          status: "OPEN", isMilestone: false, sourceType: "USER", parentTaskId: realParentId,
          assignments: s.assignments, assigneeId: s.assigneeId
        });
      }
      toast({ title: "Thành công", description: "Dự án đã được khởi tạo." });
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error?.message || "Có lỗi xảy ra" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    projectName, setProjectName, isSubmitting,
    boards, departmentsCache, tasks, membersCache,
    addSubTask, removeTask, updateTask,
    handleBoardChange, handleDepartmentChange, handleSubmit,
  };
};