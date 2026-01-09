import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

interface CommentInputProps {
  loading?: boolean;
  placeholder?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

export const CommentInput = ({ loading, placeholder = "Viết bình luận...", onSubmit, onCancel }: CommentInputProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent(""); 
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <Textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none text-sm bg-white border-slate-200 focus:border-[#009d98] focus:ring-[#009d98] rounded-xl pr-12"
        disabled={loading}
      />
      <div className="flex justify-end gap-2 absolute bottom-2 right-2">
        {onCancel && (
           <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading} className="h-8 text-xs text-slate-500 hover:text-slate-700">
             Hủy
           </Button>
        )}
        <Button 
          size="icon" 
          onClick={handleSubmit} 
          disabled={loading || !content.trim()}
          className="bg-[#009d98] hover:bg-[#008580] text-white h-8 w-8 rounded-lg shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </Button>
      </div>
    </div>
  );
};