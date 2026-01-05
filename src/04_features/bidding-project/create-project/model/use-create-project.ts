import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { organizationApi, OrganizationUnit } from "@/entities/organization";
import { biddingProjectApi } from "@/entities/bidding-project";
import { taskApi, TaskAssignment, TaskTag } from "@/entities/task"; 
import { driveApi, DriveItem } from "@/entities/drive"; 
import { TempTask, DEFAULT_PROJECT_STRUCTURE, DriveStructureItem, InitProjectResponse } from "./create-project.model";

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

  // --- LOGIC DRIVE AUTO-FETCH ---
  const fetchAutoDocuments = useCallback(async (currentTasks: TempTask[]) => {
    try {
      console.log("🔍 Đang tìm tài liệu mẫu từ Drive...");
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
      console.log(`✅ Tìm thấy tổng cộng ${totalFiles} file mẫu.`);
      
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

  // --- HELPER ACTIONS ---
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

  // --- SUBMIT: CLONE FILES & CREATE PROJECT ---
  const handleSubmit = async () => {
    console.group("🚀 START SUBMIT PROCESS");
    
    if (!projectName.trim()) return toast({ variant: "destructive", description: "Vui lòng nhập tên dự án" });
    setIsSubmitting(true);
    
    const idMap: Record<string, number> = {};
    let errorCount = 0;

    try {
      // 1. Tạo Project trong DB
      console.time("Create Project DB");
      const projectRes = await biddingProjectApi.create({ 
        name: projectName, status: "New", sourcePackageId: hsmtId 
      });
      console.timeEnd("Create Project DB");
      const newProjectId = projectRes.id;
      console.log(`✅ Project Created with ID: ${newProjectId}`);

      // 2. Init Drive & Lấy cấu trúc Folder mới
      let driveStructureLog: DriveStructureItem[] = [];
      if (newProjectId) {
         try { 
             console.log("⏳ Calling Init Drive API...");
             const initRes: InitProjectResponse = await driveApi.initProject({ projectId: newProjectId });
             console.log("📡 Init Response (CamelCase):", initRes);
             
             // [FIX] Sử dụng camelCase để khớp với Interceptor
             if (initRes && initRes.driveData && Array.isArray(initRes.driveData.structureLog)) {
                 driveStructureLog = initRes.driveData.structureLog;
                 console.log(`✅ Drive Structure Log Loaded: ${driveStructureLog.length} items`);
             } else {
                 console.warn("⚠️ Warning: Structure Log not found or empty in response!");
                 console.log("👉 Response keys:", Object.keys(initRes || {}));
             }
         } catch (e) { 
             console.error("❌ Drive init error:", e);
             toast({ variant: "destructive", title: "Lỗi Drive", description: "Không thể khởi tạo cấu trúc thư mục." });
         }
      }

      // --- HELPER: CLONE FILES LOGIC (WITH LOGS) ---
      const processFilesForTask = async (task: TempTask): Promise<string[]> => {
          if (!task.files || task.files.length === 0) {
              return [];
          }
          
          console.group(`📂 CLONE FILES FOR: ${task.name} (${task.tag})`);
          console.log(`Files count: ${task.files.length}`);

          if (driveStructureLog.length === 0) {
             console.error("❌ Error: driveStructureLog is empty. Cannot find target folder.");
             console.groupEnd();
             return [];
          }
          
          // MAP: Tìm folder đích dựa trên TAG
          const targetFolder = driveStructureLog.find(f => f.tag === task.tag);
          
          if (!targetFolder) {
              console.warn(`⚠️ Warning: Tag "${task.tag}" found in Task but NOT FOUND in Drive Structure.`);
              console.log("👉 Available Folder Tags:", driveStructureLog.map(d => d.tag));
              console.groupEnd();
              return [];
          }

          console.log(`✅ Target Folder Found: [${targetFolder.name}] (ID: ${targetFolder.id})`);

          const newFileLinks: string[] = [];
          
          for (const file of task.files) {
              try {
                  console.log(`... Cloning file: ${file.name} (Source: ${file.id})`);
                  
                  // Gọi API Clone với Params camelCase (Interceptor sẽ lo vụ snake_case)
                  const copyRes = await driveApi.cloneFile({
                      sourceFileId: file.id,       
                      targetFolderId: targetFolder.id 
                  });

                  console.log("✅ Clone Success:", copyRes);

                  if (copyRes && copyRes.webViewLink) {
                      newFileLinks.push(copyRes.webViewLink);
                  }
              } catch (err) {
                  console.error(`❌ Clone Failed: ${file.name}`, err);
              }
          }
          console.groupEnd();
          return newFileLinks;
      };

      // 3. Tạo Parent Tasks (Level 0)
      const parentTasks = tasks.filter(t => t.parentId === null);

      for (const p of parentTasks) {
        try {
          // [ACTION] Clone file vào folder đích
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
            attachmentUrl: clonedLinks 
          });
          idMap[p.id] = res.id;
        } catch (err) {
          console.error(`❌ Lỗi tạo Parent Task: ${p.name}`, err);
          errorCount++;
        }
      }

      // 4. Tạo Sub Tasks (Level 1)
      const subTasks = tasks.filter(t => t.parentId !== null && t.name.trim() !== "");
      
      for (const s of subTasks) {
        try {
          const realParentId = s.parentId ? idMap[s.parentId] : null;
          if (!realParentId) continue;
          
          // [ACTION] Clone file cho subtask
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
            attachmentUrl: clonedLinks
          });

        } catch (err: any) {
          console.error(`❌ Lỗi tạo Sub Task: ${s.name}`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        toast({ title: "Hoàn tất có cảnh báo", description: `Có ${errorCount} công việc chưa tạo được.`, variant: "destructive" });
      } else {
        toast({ title: "Thành công", description: "Dự án đã được khởi tạo và đồng bộ hồ sơ." });
      }
      
      console.groupEnd(); // End Main Group
      onClose();

    } catch (error: any) {
      console.error("❌ FATAL ERROR:", error);
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: error?.message || "Có lỗi xảy ra" });
      console.groupEnd();
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