import { useEffect, useState, useMemo } from "react";
import { 
  FileCode, FileType, AlertCircle, ArrowLeft, Save, Loader2 
} from "lucide-react";

// Shared UI
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { Alert, AlertDescription } from "@/shared/ui/alert";

// Entities & API
import { Template, templateApi } from "@/entities/template";
import { draftingApi, DraftMetadata, SaveDraftPayload } from "../api/drafting-api"; // Cần update file api này trước

// Feature Components
import { TemplateSelector } from "./template-selector";
import { RichTextEditor } from "./rich-text-editor";
import { RawHtmlEditor } from "./raw-html-editor"; 
import { AiAssistant } from "./ai-assistant"; 
import { DraftingConfigPanel } from "./drafting-config-panel"; // Component mới

// Libs
import { parseHtmlToEditorData, mergeHtmlFromEditorData } from "../lib/html-processor";

interface DraftingFlowProps {
  taskId: number;
  taskName: string;
}

type Step = "SELECT" | "EDITOR";
type EditorMode = "RICH_TEXT" | "RAW_HTML";

export const DraftingFlow = ({ taskId, taskName }: DraftingFlowProps) => {
  const { toast } = useToast();

  // --- STATE ---
  const [step, setStep] = useState<Step>("SELECT");
  const [editorMode, setEditorMode] = useState<EditorMode>("RICH_TEXT");
  const [fullHtmlContent, setFullHtmlContent] = useState("");
  
  // State mới cho Metadata
  const [metadata, setMetadata] = useState<DraftMetadata>({});

  // Data Loading State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. LOAD TEMPLATES ---
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const data = await templateApi.getList();
        setTemplates(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không tải được mẫu." });
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [toast]);

  // --- 2. HTML PARSER ---
  const parsedData = useMemo(() => {
    return parseHtmlToEditorData(fullHtmlContent);
  }, [fullHtmlContent]);

  // --- HANDLERS ---
  const handleSelectTemplate = (content: string) => {
    setFullHtmlContent(content);
    setStep("EDITOR");
    setEditorMode("RICH_TEXT");
  };

  const handleLoadDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const res = await draftingApi.loadDraft(taskId);
      // Giả sử API trả về { draftContent, metadata }
      // Nếu API cũ chỉ trả string, code này cần chỉnh lại type casting
      if (typeof res === 'object' && res.draftContent) {
          setFullHtmlContent(res.draftContent);
          if (res.metadata) setMetadata(res.metadata);
      } else if (typeof res === 'string') {
          setFullHtmlContent(res); // Fallback cho API cũ
      } else {
          toast({ description: "Chưa có bản nháp." });
          return;
      }
      
      setStep("EDITOR");
      setEditorMode("RICH_TEXT");
      toast({ title: "Đã tải bản nháp", className: "bg-[#009d98] text-white" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không tải được bản nháp." });
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleBackToSelect = () => {
    setStep("SELECT");
  };

  // Logic Save mới: Gửi cả Content + Metadata
  const executeSaveApi = async (contentToSave: string) => {
    setIsSaving(true);
    try {
      const payload: SaveDraftPayload = {
        content: contentToSave,
        metadata: metadata
      };
      await draftingApi.saveDraft(taskId, payload);
      setFullHtmlContent(contentToSave);
      toast({ title: "Đã lưu", description: "Nội dung và cấu hình đã được lưu." });
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRichTextSave = (newBody: string) => {
      const cssToUse = parsedData.originalCss || "";
      const mergedHtml = mergeHtmlFromEditorData(cssToUse, newBody);
      executeSaveApi(mergedHtml);
  };

  const handleRawHtmlSave = (newFullHtml: string) => executeSaveApi(newFullHtml);

  // Logic nhận nội dung từ AI (Append vào nội dung hiện tại)
  const handleAiGenerated = (aiHtml: string) => {
     // Đơn giản là nối vào cuối, hoặc chèn vào vị trí con trỏ (phức tạp hơn)
     // Ở đây ta tạm nối vào cuối body
     const newBody = parsedData.bodyContent + "<br/>" + aiHtml;
     const merged = mergeHtmlFromEditorData(parsedData.originalCss, newBody);
     setFullHtmlContent(merged);
  };

  // --- RENDER ---
  if (step === "SELECT") {
    return (
      <TemplateSelector 
        templates={templates} 
        isLoading={isLoadingTemplates} 
        onSelect={handleSelectTemplate}
        onLoadDraft={handleLoadDraft}
        isLoadingDraft={isLoadingDraft}
      />
    );
  }

  // --- GIAO DIỆN 3 CỘT MỚI ---
  return (
    <div className="h-[calc(100vh-60px)] w-full flex flex-col bg-slate-100 overflow-hidden">
        
        {/* TOP BAR NHỎ */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0 h-12">
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="sm" onClick={handleBackToSelect} className="text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Mẫu
               </Button>
               <div className="h-4 w-px bg-slate-200" />
               <span className="font-bold text-slate-700 text-sm truncate max-w-[300px]">{taskName}</span>
            </div>

            <div className="flex items-center gap-2">
               {editorMode === "RICH_TEXT" && (
                   <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Auto-save tắt
                   </div>
               )}
               <Button 
                 size="sm" 
                 onClick={() => executeSaveApi(fullHtmlContent)} 
                 disabled={isSaving}
                 className="bg-[#009d98] hover:bg-[#008580] text-white h-8"
               >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />} Lưu
               </Button>
               <Button 
                 variant="outline" size="sm" h-8
                 onClick={() => setEditorMode(m => m === "RICH_TEXT" ? "RAW_HTML" : "RICH_TEXT")}
                 className="text-xs"
               >
                  {editorMode === "RICH_TEXT" ? <FileCode className="w-3 h-3 mr-1"/> : <FileType className="w-3 h-3 mr-1"/>}
                  {editorMode === "RICH_TEXT" ? "Code" : "Visual"}
               </Button>
            </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* 1. LEFT CONFIG */}
            <DraftingConfigPanel 
               defaultValues={metadata}
               onMetadataChange={setMetadata}
               onAiGenerated={handleAiGenerated}
            />

            {/* 2. CENTER EDITOR */}
            <div className="flex-1 overflow-hidden relative flex flex-col min-w-0 bg-slate-100/50">
               {editorMode === "RICH_TEXT" ? (
                  <RichTextEditor 
                    initialContent={parsedData.bodyContent}
                    css={parsedData.editorCss}
                    onBack={() => {}} // Đã bỏ nút back trong editor vì có topbar
                    onSave={handleRichTextSave}
                    isSaving={isSaving}
                    isReadOnly={false}
                  />
               ) : (
                  <RawHtmlEditor 
                    initialContent={fullHtmlContent}
                    onBack={() => {}} 
                    onSave={handleRawHtmlSave}
                    isSaving={isSaving}
                  />
               )}
            </div>

            {/* 3. RIGHT AI */}
            <div className="w-[350px] shrink-0 border-l border-slate-200 bg-white h-full hidden lg:block">
               <AiAssistant 
                 isOpen={true} 
                 onClose={() => {}}
                 currentHtml={fullHtmlContent}
                 onApplyChanges={(html) => setFullHtmlContent(html)}
                 mode="embedded"
               />
            </div>
        </div>
    </div>
  );
};