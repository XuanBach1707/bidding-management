import { useState, useCallback } from 'react';
import { 
  aiBiddingApi, 
  AiMessage, 
  aiSearchSchema, 
  aiIngestSchema 
} from '@/entities/ai-bidding';
import { nanoid } from 'nanoid'; // Hoặc dùng Date.now() + Math.random() nếu không muốn cài thêm lib
import { CHAT_ERROR_MESSAGE } from './constants';

export const useBiddingChat = () => {
  // --- STATE ---
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);     // Trạng thái AI đang trả lời
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang upload file

  // --- ACTIONS ---

  /**
   * 1. Gửi tin nhắn tra cứu
   */
  const sendMessage = useCallback(async (query: string) => {
    // Validate input rỗng
    const validation = aiSearchSchema.safeParse({ query });
    if (!validation.success) {
      // Có thể return lỗi hoặc handle UI error tại đây
      return;
    }

    const userMsgId = nanoid();
    
    // 1. Optimistic Update: Hiển thị tin nhắn User ngay lập tức
    const userMsg: AiMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      createdAt: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Gọi API
      const responseMarkdown = await aiBiddingApi.search({ query });

      // 3. Tạo tin nhắn phản hồi từ AI
      const aiMsg: AiMessage = {
        id: nanoid(),
        role: 'ai',
        content: responseMarkdown, // API trả về string markdown
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Xử lý lỗi: Thêm tin nhắn lỗi hoặc Toast
      const errorMsg: AiMessage = {
        id: nanoid(),
        role: 'ai',
        content: CHAT_ERROR_MESSAGE,
        createdAt: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  }, []);

  /**
   * 2. Upload file tài liệu (RAG)
   * Hàm này trả về Promise để UI có thể await và hiện Toast thành công/thất bại
   */
  const uploadContextFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      // 1. Validate File qua Zod Schema (Entity)
      // Nếu sai, Zod sẽ throw error, ta catch ở dưới để báo UI
      const validData = aiIngestSchema.parse({ file });

      // 2. Gọi API Ingest Async
      await aiBiddingApi.ingestFile({ file: validData.file });
      
      return { success: true, message: "Đã tiếp nhận tài liệu. AI sẽ học dữ liệu này trong giây lát." };
    } catch (error: any) {
      // Xử lý lỗi từ Zod hoặc API
      let msg = "Upload thất bại.";
      
      // Check lỗi Zod
      if (error.issues && Array.isArray(error.issues)) {
        msg = error.issues[0]?.message || msg;
      } 
      // Check lỗi Axios
      else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }

      return { success: false, message: msg };
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * 3. Reset hội thoại (nếu cần)
   */
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    isUploading,
    sendMessage,
    uploadContextFile,
    clearChat
  };
};