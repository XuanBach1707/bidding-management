import { useEffect, useState } from "react";
import { Users, Truck, CheckSquare, Plus, Loader2, FileText, ExternalLink } from "lucide-react";
import { Task } from "@/entities/task";
import { driveApi, DriveItem } from "@/entities/drive";
import { requirementApi, RequirementItem, PersonnelReq, EquipmentReq } from "@/entities/requirement";
import { biddingProjectApi } from "@/entities/bidding-project";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/shared/ui/dialog"; 
import { ResourceRepositoryBrowser } from "./resource-repository-browser"; 

interface SelectionBrowserProps {
  task: Task;
  isReadOnly?: boolean; // [MỚI] Thêm prop này
}

export const SelectionBrowser = ({ task, isReadOnly = false }: SelectionBrowserProps) => {
  // --- STATE ---
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [projectFiles, setProjectFiles] = useState<DriveItem[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC 1: LOAD YÊU CẦU (Giữ nguyên) ---
  useEffect(() => {
    const fetchReqs = async () => {
      // ... (Code fetchReqs giữ nguyên y hệt cũ)
      console.log("🚀 [SelectionBrowser] Bắt đầu fetchReqs...", { taskId: task.id });

      if (!task.biddingProjectId || !task.tag) return;

      setLoadingReq(true);
      try {
        const resPkg = await biddingProjectApi.getByProject(task.biddingProjectId);
        const hsmtId = resPkg.data?.hsmtId;
        
        if (!hsmtId) return;

        let data: RequirementItem[] = [];
        if (task.tag === "HR") {
           data = await requirementApi.getPersonnel(hsmtId);
        } else if (task.tag === "DEVICE") {
           data = await requirementApi.getEquipment(hsmtId);
        }
        
        setRequirements(data);

      } catch (e) {
        console.error("❌ [SelectionBrowser] Lỗi load requirements:", e);
      } finally {
        setLoadingReq(false);
      }
    };

    fetchReqs();
  }, [task.biddingProjectId, task.tag]);

  // --- LOGIC 2: LOAD FILE DỰ ÁN (Giữ nguyên) ---
  const fetchProjectFiles = async () => {
    if (!task.biddingProjectId) return;
    setLoadingFiles(true);
    try {
      const resResources = await driveApi.getProjectFolders(task.biddingProjectId);
      
      if (resResources.currentFolderId) {
        const cleanId = resResources.currentFolderId.trim();
        const resTarget = await driveApi.getTargetFolder(cleanId, task.biddingProjectId);
        
        const tId = resTarget.targetFolderId;
        setTargetFolderId(tId); 

        if (tId) {
            const fileRes = await driveApi.getFolderDetail(tId);
            setProjectFiles(fileRes.data.filter(i => i.type === "FILE"));
        }
      }
    } catch (e) {
      console.error("Lỗi load file dự án:", e);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchProjectFiles();
  }, [task.biddingProjectId]);

  // --- RENDER ---
  return (
    <div className="flex h-[600px] gap-6 font-sans">
      
      {/* CỘT TRÁI: YÊU CẦU (Chỉ xem -> Giữ nguyên) */}
      <div className="w-1/2 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            {task.tag === "HR" ? <Users className="w-4 h-4"/> : <Truck className="w-4 h-4"/>}
            Yêu cầu từ E-HSMT
          </h3>
          <span className="bg-white border px-2 py-0.5 rounded-full text-xs font-bold text-gray-600 shadow-sm">
            {requirements.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {loadingReq ? (
             <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500 inline"/></div>
          ) : requirements.length === 0 ? (
             <div className="text-center py-10 text-gray-400 italic">Không có yêu cầu nào.</div>
          ) : (
            requirements.map((req) => (
              <div key={req.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="flex gap-3">
                   <CheckSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                   <div>
                      <h4 className="text-sm font-bold text-gray-800">
                         {(req as PersonnelReq).positionName || (req as EquipmentReq).equipmentName}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                         <p>Số lượng: <strong className="text-gray-900">{req.quantity}</strong></p>
                         {'qualificationReq' in req && (
                           <p className="line-clamp-2" title={req.qualificationReq}>Yêu cầu: {req.qualificationReq}</p>
                         )}
                         {'specifications' in req && req.specifications && (
                           <p className="line-clamp-2">TSKT: {req.specifications}</p>
                         )}
                      </div>
                   </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">BẮT BUỘC</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: KẾT QUẢ / FILE ĐÃ CHỌN */}
      <div className="w-1/2 flex flex-col border rounded-lg bg-white shadow-sm overflow-hidden border-dashed border-blue-200">
        
        <div className="p-4 border-b flex justify-between items-center bg-blue-50/30">
           <h3 className="font-bold text-gray-700">Tài liệu dự thầu đã chọn</h3>
           {loadingFiles && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
           {projectFiles.length > 0 ? (
             <div className="space-y-2 w-full">
                {projectFiles.map(file => (
                  <div key={file.id} className="flex items-center p-2 bg-blue-50 border border-blue-100 rounded group">
                     <FileText className="w-4 h-4 text-blue-600 mr-2" />
                     <span className="text-sm font-medium text-gray-700 truncate flex-1">{file.name}</span>
                     {file.link && (
                        <a href={file.link} target="_blank" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-1">
                           <ExternalLink className="w-3 h-3" />
                        </a>
                     )}
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                   <Plus className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Chưa có tài liệu nào.</p>
                {/* Ẩn dòng hướng dẫn nếu đang ReadOnly để đỡ gây hiểu nhầm */}
                {!isReadOnly && <p className="text-xs text-gray-400">Chọn từ kho để thêm vào hồ sơ.</p>}
             </div>
           )}
        </div>

        {/* [QUAN TRỌNG] Footer: Ẩn nút thêm nếu ReadOnly */}
        {!isReadOnly && (
            <div className="p-4 border-t bg-gray-50">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Chọn tài liệu từ Kho tài nguyên
                    </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
                    <div className="p-4 border-b">
                        <DialogTitle className="text-lg font-bold text-gray-800">Kho tài nguyên chung</DialogTitle>
                        <p className="text-sm text-gray-500">Chọn tài liệu mẫu để clone vào dự án</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ResourceRepositoryBrowser 
                            task={task} 
                            preloadedTargetId={targetFolderId} 
                            onSuccess={() => {
                                fetchProjectFiles();
                            }} 
                        />
                    </div>
                </DialogContent>
                </Dialog>
            </div>
        )}
      </div>

    </div>
  );
};