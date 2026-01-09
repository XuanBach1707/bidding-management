import { useEffect, useState } from "react";
import { Users, Truck, CheckSquare, Plus, Loader2, FileText, ExternalLink, BoxSelect } from "lucide-react";
import { Task } from "@/entities/task";
import { driveApi, DriveItem } from "@/entities/drive";
import { requirementApi, RequirementItem, PersonnelReq, EquipmentReq } from "@/entities/requirement";
import { biddingProjectApi } from "@/entities/bidding-project";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/shared/ui/dialog"; 
import { ResourceRepositoryBrowser } from "./resource-repository-browser"; 
import { Badge } from "@/shared/ui/badge";

interface SelectionBrowserProps {
  task: Task;
  isReadOnly?: boolean; 
}

export const SelectionBrowser = ({ task, isReadOnly = false }: SelectionBrowserProps) => {
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [projectFiles, setProjectFiles] = useState<DriveItem[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIC 1: LOAD YÊU CẦU ---
  useEffect(() => {
    const fetchReqs = async () => {
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
        console.error("Lỗi load requirements:", e);
      } finally {
        setLoadingReq(false);
      }
    };

    fetchReqs();
  }, [task.biddingProjectId, task.tag]);

  // --- LOGIC 2: LOAD FILE DỰ ÁN ---
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
    <div className="flex flex-col lg:flex-row h-[600px] gap-6 font-sans">
      
      {/* CỘT TRÁI: YÊU CẦU */}
      <div className="w-full lg:w-1/2 flex flex-col border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            {task.tag === "HR" ? <Users className="w-4 h-4 text-slate-500"/> : <Truck className="w-4 h-4 text-slate-500"/>}
            Yêu cầu E-HSMT
          </h3>
          <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 shadow-sm">
            {requirements.length}
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar">
          {loadingReq ? (
             <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#009d98] inline"/></div>
          ) : requirements.length === 0 ? (
             <div className="text-center py-10 text-slate-400 italic text-sm">Không tìm thấy yêu cầu nào.</div>
          ) : (
            requirements.map((req) => (
              <div key={req.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-sm hover:border-[#009d98]/30 transition-all group">
                <div className="flex gap-3">
                   <div className="mt-0.5"><CheckSquare className="w-4 h-4 text-[#009d98]" /></div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                          {(req as PersonnelReq).positionName || (req as EquipmentReq).equipmentName}
                      </h4>
                      <div className="text-xs text-slate-500 mt-1.5 space-y-1">
                          <p>Số lượng: <strong className="text-slate-900">{req.quantity}</strong></p>
                          {'qualificationReq' in req && (
                            <p className="line-clamp-2 text-slate-600">Yêu cầu: {req.qualificationReq}</p>
                          )}
                          {'specifications' in req && req.specifications && (
                            <p className="line-clamp-2 text-slate-600">TSKT: {req.specifications}</p>
                          )}
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: KẾT QUẢ */}
      <div className="w-full lg:w-1/2 flex flex-col border border-dashed border-slate-300 rounded-xl bg-slate-50/30 overflow-hidden relative">
        
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
           <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
              <BoxSelect className="w-4 h-4 text-[#009d98]" /> Tài liệu đã chọn
           </h3>
           {loadingFiles && <Loader2 className="w-4 h-4 animate-spin text-[#009d98]" />}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col custom-scrollbar">
           {projectFiles.length > 0 ? (
             <div className="space-y-2 w-full">
                {projectFiles.map(file => (
                  <div key={file.id} className="flex items-center p-3 bg-white border border-slate-200 rounded-lg group shadow-sm hover:border-[#009d98]/30 transition-all">
                     <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 mr-3 group-hover:text-[#009d98] group-hover:bg-[#009d98]/10">
                        <FileText className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-medium text-slate-700 truncate flex-1 group-hover:text-[#009d98] transition-colors">{file.name}</span>
                     {file.link && (
                        <a href={file.link} target="_blank" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#009d98] p-1.5 hover:bg-slate-100 rounded-md transition-all">
                           <ExternalLink className="w-4 h-4" />
                        </a>
                     )}
                  </div>
                ))}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Chưa có tài liệu nào.</p>
                {!isReadOnly && <p className="text-xs text-slate-400 mt-1">Chọn từ kho để thêm vào hồ sơ.</p>}
             </div>
           )}
        </div>

        {/* Footer Action */}
        {!isReadOnly && (
            <div className="p-4 border-t border-slate-200 bg-white">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full bg-[#009d98] hover:bg-[#008580] text-white font-bold h-11 shadow-md gap-2">
                        <Plus className="w-5 h-5" />
                        Chọn từ Kho tài nguyên
                    </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 border-none shadow-2xl">
                    <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <DialogTitle className="text-lg font-extrabold text-slate-800">Kho tài nguyên chung</DialogTitle>
                        <DialogDescription>Duyệt và chọn tài liệu mẫu để clone vào dự án hiện tại.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden bg-white">
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