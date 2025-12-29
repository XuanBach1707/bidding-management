import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea"; // Hoặc Input

interface CommentInputProps {
  loading?: boolean;
  placeholder?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void; // Dùng khi huỷ reply
}

export const CommentInput = ({ loading, placeholder = "Viết bình luận...", onSubmit, onCancel }: CommentInputProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent(""); // Clear form sau khi gửi
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none text-sm bg-white"
        disabled={loading}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
           <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
             Hủy
           </Button>
        )}
        <Button 
          size="sm" 
          onClick={handleSubmit} 
          disabled={loading || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
          Gửi
        </Button>
      </div>
    </div>
  );
};