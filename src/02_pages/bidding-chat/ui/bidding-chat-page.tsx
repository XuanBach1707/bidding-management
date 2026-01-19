"use client";

import React, { useState } from 'react';
import { 
  BiddingChatCollectionList,
  // useBiddingChat // Hook logic để ở dưới, page chỉ lo UI
} from '@/features/bidding-lookup-chat';
import { BiddingChatWindow } from '@/widgets/bidding-chat-window'; 
import { BiddingChatFileList } from '@/widgets/bidding-chat-file-list';

import { Sparkles, FileText, MessageSquare, Server } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const BiddingChatPage = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'collections'>('chat');

  return (
    // [Mobile Fix]: Dùng 100dvh để fix lỗi keyboard/address bar trên mobile
    <div className="relative flex flex-col w-full h-[calc(100dvh-64px)] bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Background Decor (Giữ nguyên) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-500/5 rounded-full blur-[60px] md:blur-[100px] opacity-50" />
      </div>

      {/* Tab Switcher Header */}
      <header className="relative z-20 flex items-center justify-center pt-2 md:pt-4 pb-2 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm shrink-0">
        {/* [Mobile Fix]: Thêm max-w-full và overflow-x-auto để scroll ngang tab trên màn hình bé */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-900 rounded-xl shadow-inner border border-gray-200 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-[95vw]">
          
          {/* TAB CHAT */}
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
              activeTab === 'chat' 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Trợ lý Bidding
          </button>
          
          {/* TAB DOCUMENTS */}
          <button
            onClick={() => setActiveTab('files')}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
              activeTab === 'files' 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            )}
          >
            <FileText className="w-4 h-4" />
            Cơ sở dữ liệu
          </button>

          {/* TAB COLLECTIONS */}
          <button
            onClick={() => setActiveTab('collections')}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
              activeTab === 'collections' 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            )}
          >
            <Server className="w-4 h-4" />
            Collections
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 z-10 w-full h-full flex flex-col relative overflow-hidden">
        
        {/* VIEW: CHAT */}
        {/* [Mobile Fix]: Với Chat, ta để p-0 trên mobile để tận dụng tối đa diện tích, 
            tránh việc padding làm khung chat bị bé khi bàn phím bật lên */}
        <div className={cn("flex-1 w-full h-full transition-all duration-300", 
             activeTab === 'chat' ? "block opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4",
             "p-0 md:p-6" // Mobile: 0 padding, PC: padding 6
        )}>
          <BiddingChatWindow />
        </div>

        {/* VIEW: DOCUMENTS */}
        <div className={cn("flex-1 w-full h-full p-4 md:p-6 transition-all duration-300 overflow-hidden", 
             activeTab === 'files' ? "block opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4")}>
          <div className="max-w-6xl mx-auto h-full">
            <BiddingChatFileList />
          </div>
        </div>

        {/* VIEW: COLLECTIONS */}
        <div className={cn("flex-1 w-full h-full p-4 md:p-6 transition-all duration-300 overflow-hidden", 
             activeTab === 'collections' ? "block opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4")}>
          <div className="max-w-6xl mx-auto h-full">
            <BiddingChatCollectionList />
          </div>
        </div>
      </main>

      {/* Decorative Sparkles */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none opacity-20">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>

    </div>
  );
};