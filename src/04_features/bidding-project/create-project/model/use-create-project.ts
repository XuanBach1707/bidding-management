import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { organizationApi, OrganizationUnit } from "@/entities/organization";
import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment, TaskTag, TaskType } from "@/entities/task"; 
import { driveApi, DriveItem } from "@/entities/drive"; 
import { TempTask, FIXED_SECTIONS } from "./create-project.model";

interface UseCreateProjectProps {
  isOpen: boolean;
  hsmtId: number;
  defaultName: string; // Đây chính là MA_TBMT
  onClose: () => void;
}

export const useCreateProject = ({ isOpen, hsmtId, defaultName, onClose }: UseCreateProjectProps) => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState(defaultName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [boards, setBoards] = useState<OrganizationUnit[]>([]);
  const [departmentsCache, setDepartmentsCache] = useState<Record<number, OrganizationUnit[]>>({});
  
  const [tasks, setTasks] = useState<TempTask[]>([]);

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

  // --- LOGIC DRIVE (GIỮ NGUYÊN) ---
  const fetchAutoDocuments = useCallback(async () => {
    try {
      const rootRes = await driveApi.getRootProjects();
      const khoTaiLieu = rootRes.data.find(item => item.name === "KHO TÀI LIỆU" && item.type === "FOLDER");
      if (!khoTaiLieu) return;

      const subRes = await driveApi.getFolderDetail(khoTaiLieu.id);
      const legalFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ pháp lý" && item.type === "FOLDER");
      const financeFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ tài chính" && item.type === "FOLDER");

      const updates: Record<string, DriveItem[]> = {};
      let foundTargetFolders = false; 

      if (legalFolder) {
        foundTargetFolders = true;
        try {
           const res = await driveApi.getFolderDetail(legalFolder.id);
           updates["fixed_1"] = res.data.filter(i => i.type === "FILE");
        } catch (err) { console.error(err); }
      }

      if (financeFolder) {
        foundTargetFolders = true;
        try {
           const res = await driveApi.getFolderDetail(financeFolder.id);
           updates["fixed_4"] = res.data.filter(i => i.type === "FILE");
        } catch (err) { console.error(err); }
      }

      const totalFilesFound = Object.values(updates).reduce((acc, files) => acc + files.length, 0);

      if (totalFilesFound > 0) {
        setTasks(prev => prev.map(t => {
          if (updates[t.id]) return { ...t, files: updates[t.id] };
          return t;
        }));
        toast({ title: "Đồng bộ dữ liệu", description: `Đã tự động tải ${totalFilesFound} tài liệu từ Drive.` });
      } else if (foundTargetFolders) {
        toast({ variant: "destructive", title: "Dữ liệu trống", description: "Không có file nào được tìm thấy trong thư mục Hồ sơ." });
      }
    } catch (error) {
      console.error("Lỗi quy trình Drive:", error);
    }
  }, [toast]);

  // --- INIT DATA ---
  useEffect(() => {
    if (isOpen) {
      organizationApi.getBoards().then((fetchedBoards) => {
        setBoards(fetchedBoards);

        const initialTasks: TempTask[] = FIXED_SECTIONS.map((s) => {
          const matchedBoard = fetchedBoards.find((b) =>
            s.keywords.some((k) => b.unitName.toLowerCase().includes(k.toLowerCase()))
          );

          const t: TempTask = {
            id: s.id,
            name: s.name,
            tag: s.tag as TaskTag, // Cast type rõ ràng
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
        if (t.id === taskId || t.parentId === taskId) {
            return { ...t, selectedBoardId: boardId, assignments: [], assigneeId: undefined };
        }
        return t;
    }));
  };

  const handleDepartmentChange = (taskId: string, departmentIdStr: string) => {
    const deptId = Number(departmentIdStr);
    const newAssignment = {
      assignedUnitId: deptId,
      requiredRole: "SPECIALIST",
      requiredMinSecurity: 2,
      assignmentType: "MAIN",
      assignedUserId: null, 
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
      tag: parentTask?.tag || "OTHER" as TaskTag,
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
    
    setIsSubmitting(true);
    try {
      // 1. Tạo Project trong DB
      const projectRes = await biddingProjectApi.create({ name: projectName, status: "New", sourcePackageId: hsmtId });
      const newProjectId = projectRes.id;
      
      // 2. [MỚI] Gọi API Init Drive (Chạy ngầm - không await chặn UI, hoặc await nếu muốn chắc chắn)
      // Dùng defaultName (ma_tbmt) để tạo folder như yêu cầu
      try {
        if (defaultName) {
           await driveApi.initProject({ projectName: defaultName });
           console.log("Đã gửi yêu cầu init drive folder cho:", defaultName);
        }
      } catch (driveErr) {
        console.error("Lỗi Init Drive:", driveErr);
        // Có thể không chặn luồng chính nếu drive lỗi, tùy nghiệp vụ
      }

      const parentMap: Record<string, number> = {};
      const parentTasks = tasks.filter((t) => t.isFixed);

      // 3. Tạo các Parent Task
      for (const p of parentTasks) {
        const hasAutoFiles = p.files && p.files.length > 0;
        const initialStatus = hasAutoFiles ? "COMPLETED" : "OPEN";

        const res = await taskApi.create({
          taskName: p.name, 
          biddingProjectId: newProjectId, 
          deadline: p.deadline ? p.deadline.toISOString() : undefined,
          status: initialStatus, 
          priority: "HIGH", 
          sourceType: "SYSTEM",
          
          // [FIX LỖI] Thêm taskType & tag
          taskType: "DRAFTING", 
          tag: p.tag as TaskTag,

          parentTaskId: null,
          assignments: p.assignments, 
          assigneeId: undefined
        });
        parentMap[p.id] = res.id;
      }

      // 4. Tạo các Sub Task
      const subTasks = tasks.filter((t) => !t.isFixed && t.name.trim() !== "");
      for (const s of subTasks) {
        const realParentId = s.parentId ? parentMap[s.parentId] : null;
        if (!realParentId) continue;

        await taskApi.create({
          taskName: s.name, 
          biddingProjectId: newProjectId, 
          deadline: s.deadline ? s.deadline.toISOString() : undefined,
          status: "OPEN", 
          priority: "MEDIUM", 
          sourceType: "USER",
          
          // [FIX LỖI] Thêm taskType & tag
          taskType: "DRAFTING",
          tag: s.tag as TaskTag,

          parentTaskId: realParentId, 
          assignments: s.assignments, 
          assigneeId: undefined 
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
    boards, departmentsCache, tasks, 
    addSubTask, removeTask, updateTask,
    handleBoardChange, handleDepartmentChange, handleSubmit,
  };
};