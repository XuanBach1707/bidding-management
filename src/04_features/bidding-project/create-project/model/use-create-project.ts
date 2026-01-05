import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { organizationApi, OrganizationUnit } from "@/entities/organization";
import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment, TaskTag } from "@/entities/task"; 
import { driveApi, DriveItem } from "@/entities/drive"; 
import { TempTask, DEFAULT_PROJECT_STRUCTURE } from "./create-project.model";

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
  
  const [boards, setBoards] = useState<OrganizationUnit[]>([]);
  const [departmentsCache, setDepartmentsCache] = useState<Record<number, OrganizationUnit[]>>({});
  
  const [tasks, setTasks] = useState<TempTask[]>([]);

  // --- HELPER: Flatten Structure ---
  const flattenStructure = (structure: typeof DEFAULT_PROJECT_STRUCTURE): TempTask[] => {
    let result: TempTask[] = [];
    structure.forEach((parent, pIndex) => {
      const parentId = `section_${pIndex}`;
      result.push({
        id: parentId,
        name: parent.name,
        tag: parent.tag || null,
        parentId: null,
        isFixed: true,
        deadline: undefined,
        assignments: [],
        selectedBoardId: undefined,
        files: [],
        subTasks: [] 
      });
      if (parent.subTasks && parent.subTasks.length > 0) {
        parent.subTasks.forEach((sub: any, sIndex: number) => {
          result.push({
            id: `${parentId}_sub_${sIndex}`,
            name: sub.name,
            tag: sub.tag,
            parentId: parentId,
            isFixed: true,
            deadline: undefined,
            assignments: [],
            selectedBoardId: undefined,
            files: [],
            subTasks: []
          });
        });
      }
    });
    return result;
  };

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

  // --- LOGIC DRIVE AUTO-FETCH (CHỈ ĐỂ HIỂN THỊ TRƯỚC FILE MẪU) ---
  const fetchAutoDocuments = useCallback(async (currentTasks: TempTask[]) => {
    try {
      const legalTask = currentTasks.find(t => t.tag === "LEGAL");
      const financeTask = currentTasks.find(t => t.tag === "FINANCE");
      if (!legalTask && !financeTask) return; 

      const rootRes = await driveApi.getRootProjects();
      const khoTaiLieu = rootRes.data.find(item => item.name === "KHO TÀI LIỆU" && item.type === "FOLDER");
      if (!khoTaiLieu) return;

      const subRes = await driveApi.getFolderDetail(khoTaiLieu.id);
      const legalFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ pháp lý" && item.type === "FOLDER");
      const financeFolder = subRes.data.find(item => item.name.trim() === "Hồ sơ tài chính" && item.type === "FOLDER");

      const updates: Record<string, DriveItem[]> = {};

      if (legalTask && legalFolder) {
        try {
           const res = await driveApi.getFolderDetail(legalFolder.id);
           const files = res.data.filter(i => i.type === "FILE");
           if (files.length > 0) updates[legalTask.id] = files;
        } catch (err) { console.error(err); }
      }

      if (financeTask && financeFolder) {
        try {
           const res = await driveApi.getFolderDetail(financeFolder.id);
           const files = res.data.filter(i => i.type === "FILE");
           if (files.length > 0) updates[financeTask.id] = files;
        } catch (err) { console.error(err); }
      }

      const totalFiles = Object.values(updates).reduce((acc, f) => acc + f.length, 0);
      if (totalFiles > 0) {
        setTasks(prev => prev.map(t => {
          if (updates[t.id]) return { ...t, files: updates[t.id] };
          return t;
        }));
        toast({ title: "Đồng bộ dữ liệu", description: `Tìm thấy ${totalFiles} tài liệu mẫu.` });
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
        const initialTasks = flattenStructure(DEFAULT_PROJECT_STRUCTURE);
        setTasks(initialTasks);
        fetchAutoDocuments(initialTasks); 
      }).catch(() => toast({ variant: "destructive", description: "Lỗi tải danh sách Ban" }));
      setProjectName(defaultName || "");
    }
  }, [isOpen, defaultName, toast, fetchAutoDocuments]);

  // --- HELPER ACTIONS (Giữ nguyên) ---
  const handleBoardChange = async (taskId: string, boardIdStr: string) => {
    const boardId = Number(boardIdStr);
    await loadDepartments(boardId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, selectedBoardId: boardId, assignments: [], assigneeId: undefined } : t)));
  };

  const handleDepartmentChange = (taskId: string, departmentIdStr: string) => {
    const deptId = Number(departmentIdStr);
    const newAssignment = { assignedUnitId: deptId, requiredRole: "SPECIALIST", requiredMinSecurity: 2, assignmentType: "MAIN", assignedUserId: null, isAccepted: false } as TaskAssignment;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignments: [newAssignment], assigneeId: undefined } : t)));
  };

  const addSubTask = (parentId: string) => {
    const parentTask = tasks.find((t) => t.id === parentId);
    const newTask: TempTask = { id: `sub_${Date.now()}_${Math.random()}`, name: "", tag: parentTask?.tag || "OTHER" as TaskTag, deadline: undefined, parentId: parentId, isFixed: false, selectedBoardId: undefined, assignments: [], assigneeId: undefined, files: [] };
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const updateTask = (id: string, field: keyof TempTask, value: any) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  // --- SUBMIT [UPDATED: CLONE FILES] ---
  const handleSubmit = async () => {
    if (!projectName.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập tên dự án" });
    setIsSubmitting(true);
    
    const idMap: Record<string, number> = {};
    let errorCount = 0;

    try {
      // 1. Tạo Project trong DB
      const projectRes = await biddingProjectApi.create({ 
        name: projectName, status: "New", sourcePackageId: hsmtId 
      });
      const newProjectId = projectRes.id;

      // 2. Init Drive & Lấy cấu trúc Folder mới
      let driveStructureLog: any[] = [];
      if (newProjectId) {
         try { 
             const initRes = await driveApi.initProject({ projectId: newProjectId });
             // Lưu lại cấu trúc folder vừa tạo để tìm đích đến copy file
             if (initRes && initRes.drive_data && initRes.drive_data.structure_log) {
                 driveStructureLog = initRes.drive_data.structure_log;
             }
         } catch (e) { console.error("Drive init error:", e); }
      }

      // Helper: Clone file từ source -> target folder mới
      const processFilesForTask = async (task: TempTask): Promise<string[]> => {
          // Nếu không có file mẫu hoặc không có cấu trúc folder mới -> trả về rỗng
          if (!task.files || task.files.length === 0 || driveStructureLog.length === 0) return [];
          
          // Tìm Folder đích dựa trên Tag (Ví dụ: Tag LEGAL -> Folder LEGAL)
          const targetFolder = driveStructureLog.find(f => f.tag === task.tag && f.type === "CHILD");
          
          if (!targetFolder) {
              console.warn(`Không tìm thấy folder đích cho tag ${task.tag}`);
              return [];
          }

          const newFileLinks: string[] = [];
          
          // Thực hiện Copy từng file
          for (const file of task.files) {
              try {
                  const copyRes = await driveApi.copyFile({
                      fileId: file.id,
                      targetFolderId: targetFolder.id,
                      newName: file.name // Giữ nguyên tên
                  });
                  if (copyRes && copyRes.webViewLink) {
                      newFileLinks.push(copyRes.webViewLink);
                  }
              } catch (err) {
                  console.error(`Lỗi copy file ${file.name}`, err);
              }
          }
          return newFileLinks;
      };

      // 3. Tạo Parent Tasks (Level 0)
      const parentTasks = tasks.filter(t => t.parentId === null);

      for (const p of parentTasks) {
        try {
          // [ACTION] Clone file nếu có
          const clonedLinks = await processFilesForTask(p);
          const hasFiles = clonedLinks.length > 0;

          const res = await taskApi.create({
            taskName: p.name, 
            biddingProjectId: newProjectId, 
            deadline: p.deadline ? p.deadline.toISOString() : undefined,
            status: hasFiles ? "COMPLETED" : "OPEN", 
            priority: "HIGH", 
            sourceType: "SYSTEM",
            taskType: hasFiles ? "SELECTION" : "DRAFTING", 
            tag: p.tag, 
            parentTaskId: null,
            assignments: p.assignments, 
            // [FIX] Sử dụng link file mới đã clone (không bao giờ null)
            attachmentUrl: clonedLinks 
          });
          idMap[p.id] = res.id;
        } catch (err) {
          console.error(`Lỗi tạo Parent Task: ${p.name}`, err);
          errorCount++;
        }
      }

      // 4. Tạo Sub Tasks (Level 1)
      const subTasks = tasks.filter(t => t.parentId !== null && t.name.trim() !== "");
      
      for (const s of subTasks) {
        try {
          const realParentId = s.parentId ? idMap[s.parentId] : null;
          if (!realParentId) continue;
          
          // [ACTION] Clone file cho subtask (nếu có, VD: HSPL, BCTC)
          const clonedLinks = await processFilesForTask(s);
          const hasFiles = clonedLinks.length > 0;

          await taskApi.create({
            taskName: s.name, 
            biddingProjectId: newProjectId, 
            deadline: s.deadline ? s.deadline.toISOString() : undefined,
            status: hasFiles ? "COMPLETED" : "OPEN", 
            priority: "MEDIUM", 
            sourceType: s.isFixed ? "SYSTEM" : "USER",
            taskType: hasFiles ? "SELECTION" : "DRAFTING",
            tag: s.tag,
            parentTaskId: realParentId,
            assignments: s.assignments, 
            // [FIX] Sử dụng link file mới
            attachmentUrl: clonedLinks
          });

        } catch (err: any) {
          console.error(`Lỗi tạo Sub Task: ${s.name}`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        toast({ title: "Hoàn tất có lỗi", description: `Có ${errorCount} công việc lỗi.`, variant: "destructive" });
      } else {
        toast({ title: "Thành công", description: "Dự án và file hồ sơ đã được khởi tạo." });
      }
      onClose();

    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi nghiêm trọng", description: error?.message || "Có lỗi xảy ra" });
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