import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils"; // Import thêm cn để xử lý class gọn hơn

// Mock Data giữ nguyên
const MOCK_DATA_MAPPING: Record<string, string> = {
  "\\[TÊN GÓI THẦU.*?\\]": "Gói thầu số 05: Thi công xây lắp trạm biến áp 110kV",
  "\\[TÊN DỰ ÁN\\]": "Dự án Cải tạo lưới điện Hạ thế Quận Cầu Giấy - Giai đoạn 2",
  "\\[TÊN CÔNG TRÌNH\\]": "Trạm biến áp 110kV Dịch Vọng",
  "\\[ĐỊA ĐIỂM THI CÔNG\\]": "Phường Dịch Vọng, Quận Cầu Giấy, TP. Hà Nội",
  "\\[TÊN ĐƠN VỊ THI CÔNG\\]": "Công ty Cổ phần Xây dựng Điện lực Việt Nam (VNECO)",
  "\\[LOGO CÔNG TY\\]": '<img src="https://via.placeholder.com/150x50/003366/ffffff?text=VNECO+GROUP" alt="Logo" />',
  "\\[NĂM\\]": "2025",
  "\\[X\\]": "24",
};

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentHtml?: string;
  onApplyChanges?: (newHtml: string) => void;
}

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  isAction?: boolean;
}

export const AiAssistant = ({ isOpen, onClose, currentHtml, onApplyChanges }: AiAssistantProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", text: "Xin chào! Tôi là trợ lý AI ProcureAgent. Tôi có thể giúp bạn viết đoạn văn, sửa lỗi hoặc gợi ý nội dung." },
    { id: "2", role: "ai", text: "Bạn có muốn tôi tự động điền các thông tin dự án vào mẫu này không?", isAction: true }
  ]);

  useEffect(() => {
    if (isOpen) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const addMessage = (role: "ai" | "user", text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text }]);
  };

  const handleAutoFill = () => {
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
      if (onApplyChanges && newHtml) {
          onApplyChanges(newHtml);
      }
      setIsTyping(false);
      addMessage("ai", "✅ Đã xong! Tôi đã điền toàn bộ thông tin dự án vào văn bản.");
    }, 2000);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage("user", inputValue);
    setInputValue("");
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Tôi đang học hỏi thêm các tính năng mới. Hiện tại tôi chỉ giỏi nhất khoản điền form thôi! 😅");
    }, 1500);
  };

  return (
    <>
      {/* SIDEBAR CONTAINER - Fixed Right */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] bg-white z-[999] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 shadow-2xl",
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
          {/* HEADER */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2 text-[#009d98]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-lg text-slate-800">AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Actions - Chuyển từ Purple sang Slate/Teal tinh tế */}
          <div className="p-4 bg-slate-50/80 space-y-2 border-b border-slate-100 shrink-0">
             <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wide">Gợi ý nhanh:</p>
             <div className="space-y-2">
                <button className="w-full text-left text-sm bg-white p-2.5 rounded border border-slate-200 text-slate-600 hover:border-[#009d98] hover:text-[#009d98] hover:bg-[#009d98]/5 transition-colors flex items-center gap-2 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 opacity-70" /> Viết giới thiệu năng lực
                </button>
                <button className="w-full text-left text-sm bg-white p-2.5 rounded border border-slate-200 text-slate-600 hover:border-[#009d98] hover:text-[#009d98] hover:bg-[#009d98]/5 transition-colors flex items-center gap-2 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 opacity-70" /> Cam kết tiến độ & chất lượng
                </button>
             </div>
          </div>

          {/* CHAT AREA */}
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
                    msg.role === 'user' 
                      ? 'bg-[#009d98] text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                  )}>
                    {msg.text}
                    {msg.isAction && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAutoFill}
                          className="w-full bg-[#009d98]/5 hover:bg-[#009d98]/10 text-[#009d98] border-[#009d98]/30 gap-2 h-8"
                        >
                          <Wand2 className="w-3.5 h-3.5" /> Tự điền dữ liệu
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-in fade-in duration-300">
                   <div className="w-8 h-8 rounded-full bg-[#009d98]/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="w-4 h-4 text-[#009d98]" />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="relative">
                <Input 
                  placeholder="Nhập yêu cầu của bạn..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="pr-10 border-slate-200 focus-visible:ring-[#009d98] focus-visible:border-[#009d98]"
                />
                <Button 
                    size="icon" 
                    onClick={handleSend} 
                    className="absolute right-1 top-1 h-8 w-8 bg-[#009d98] hover:bg-[#008580] text-white rounded-md"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
                AI có thể tạo thông tin không chính xác. Hãy kiểm tra lại.
            </p>
          </div>
      </div>
    </>
  );
};