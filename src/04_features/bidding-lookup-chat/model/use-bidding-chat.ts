import { useState, useCallback } from 'react';
import { 
  aiBiddingApi, 
  AiMessage, 
  aiSearchSchema, 
  aiIngestSchema,
  AiIngestParams // [NEW] Import type params upload
} from '@/entities/ai-bidding';
import { nanoid } from 'nanoid'; 
import { CHAT_ERROR_MESSAGE } from './constants';

export const useBiddingChat = () => {
  // --- STATE ---
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);     
  const [isUploading, setIsUploading] = useState(false); 

  // --- ACTIONS ---

  /**
   * 1. Gửi tin nhắn tra cứu
   */
  const sendMessage = useCallback(async (query: string) => {
    // Validate input rỗng
    const validation = aiSearchSchema.safeParse({ query });
    if (!validation.success) {
      return;
    }

    const userMsgId = nanoid();
    
    // Optimistic Update
    const userMsg: AiMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      createdAt: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const responseMarkdown = await aiBiddingApi.search({ query });

      const aiMsg: AiMessage = {
        id: nanoid(),
        role: 'ai',
        content: responseMarkdown, 
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
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
   * [UPDATED] Nhận object params đầy đủ thay vì chỉ file
   */
  const uploadContextFile = useCallback(async (params: AiIngestParams) => {
    setIsUploading(true);
    try {
      // 1. Validate toàn bộ data qua Zod Schema
      // Schema đã bao gồm check file size, type, và các trường meta mới
      const validData = aiIngestSchema.parse(params);

      // 2. Gọi API Ingest Async với đầy đủ params
      await aiBiddingApi.ingestFile({ 
        file: validData.file,
        legalLevel: validData.legalLevel,
        promulgationYear: validData.promulgationYear,
        collectionName: validData.collectionName
      });
      
      return { success: true, message: "Đã tiếp nhận tài liệu. AI sẽ học dữ liệu này trong giây lát." };
    } catch (error: any) {
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
   * 3. Reset hội thoại
   */
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    isUploading,
    sendMessage,
    uploadContextFile, // Bây giờ function này nhận input là object {file, legalLevel...}
    clearChat
  };
};