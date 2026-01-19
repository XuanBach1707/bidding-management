import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils"; 

// ... (Giữ nguyên MOCK_DATA_MAPPING và interfaces cũ)
const MOCK_DATA_MAPPING: Record<string, string> = {
  "\\[TÊN GÓI THẦU.*?\\]": "Gói thầu số 05: Thi công xây lắp trạm biến áp 110kV",
  "\\[TÊN DỰ ÁN\\]": "Dự án Cải tạo lưới điện Hạ thế Quận Cầu Giấy - Giai đoạn 2",
  // ... các field khác
};

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentHtml?: string;
  onApplyChanges?: (newHtml: string) => void;
  mode?: "sidebar" | "embedded"; // [MỚI] Thêm prop này
}

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  isAction?: boolean;
}

export const AiAssistant = ({ 
  isOpen, 
  onClose, 
  currentHtml, 
  onApplyChanges,
  mode = "sidebar" // Mặc định là sidebar để tương thích ngược
}: AiAssistantProps) => {
  // ... (Giữ nguyên logic state: isTyping, inputValue, messages, useEffect scroll...)
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", text: "Xin chào! Tôi là trợ lý AI ProcureAgent. Tôi có thể giúp bạn viết đoạn văn, sửa lỗi hoặc gợi ý nội dung." },
    { id: "2", role: "ai", text: "Bạn có muốn tôi tự động điền các thông tin dự án vào mẫu này không?", isAction: true }
  ]);

  useEffect(() => {
     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (role: "ai" | "user", text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text }]);
  };

  const handleAutoFill = () => {
    // ... (Logic cũ giữ nguyên)
    addMessage("user", "Ok, hãy điền giúp tôi.");
    setIsTyping(true);
    setTimeout(() => {
      let newHtml = currentHtml || "";
      if (newHtml) {
         Object.keys(MOCK_DATA_MAPPING).forEach((key) => {
           const regex = new RegExp(key, "g");
           newHtml = newHtml.replace(regex, MOCK_DATA_MAPPING[key]);
         });
      }
      if (onApplyChanges && newHtml) onApplyChanges(newHtml);
      setIsTyping(false);
      addMessage("ai", "✅ Đã xong! Tôi đã điền toàn bộ thông tin dự án vào văn bản.");
    }, 2000);
  };

  const handleSend = () => {
    // ... (Logic cũ giữ nguyên)
    if (!inputValue.trim()) return;
    addMessage("user", inputValue);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Tôi đang học hỏi thêm các tính năng mới.");
    }, 1500);
  };

  // [LOGIC MỚI] Xử lý class dựa trên mode
  const containerClass = mode === "sidebar" 
    ? cn(
        "fixed top-0 right-0 h-full w-[400px] bg-white z-[999] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 shadow-2xl",
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )
    : "h-full w-full flex flex-col bg-white border-l border-slate-200"; // Embedded mode

  return (
    <div className={containerClass}>
       {/* HEADER */}
       <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-[#009d98]">
             <Sparkles className="w-5 h-5" />
             <h3 className="font-bold text-lg text-slate-800">AI Assistant</h3>
          </div>
          {/* Chỉ hiện nút đóng nếu là sidebar */}
          {mode === "sidebar" && (
            <Button variant="ghost" size="icon" onClick={onClose}>
               <X className="w-5 h-5" />
            </Button>
          )}
       </div>

       {/* ... (Giữ nguyên phần Render Chat Area & Input Area bên dưới) ... */}
       {/* Để tiết kiệm không gian response, tôi không paste lại phần nội dung body của chat vì nó không đổi */}
       <ScrollArea className="flex-1 p-4 bg-slate-50/30">
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[#009d98]/10 flex items-center justify-center mr-2 mt-1 shrink-0 border border-[#009d98]/20">
                      <Bot className="w-4 h-4 text-[#009d98]" />
                    </div>
                 )}
                 <div className={cn(
                    "max-w-[85%] p-3 text-sm rounded-2xl shadow-sm",
                    msg.role === 'user' ? 'bg-[#009d98] text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                 )}>
                    {msg.text}
                    {msg.isAction && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <Button variant="outline" size="sm" onClick={handleAutoFill} className="w-full bg-[#009d98]/5 hover:bg-[#009d98]/10 text-[#009d98] border-[#009d98]/30 gap-2 h-8">
                           <Wand2 className="w-3.5 h-3.5" /> Tự điền dữ liệu
                        </Button>
                      </div>
                    )}
                 </div>
               </div>
            ))}
            {isTyping && (
               <div className="flex justify-start"><span className="text-xs text-slate-400 italic ml-10">AI đang viết...</span></div>
            )}
            <div ref={scrollRef} />
          </div>
       </ScrollArea>

       <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="relative">
             <Input 
               placeholder="Nhập yêu cầu..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               className="pr-10 border-slate-200 focus-visible:ring-[#009d98]"
             />
             <Button size="icon" onClick={handleSend} className="absolute right-1 top-1 h-8 w-8 bg-[#009d98] hover:bg-[#008580] text-white rounded-md">
                <Send className="w-4 h-4" />
             </Button>
          </div>
       </div>
    </div>
  );
};