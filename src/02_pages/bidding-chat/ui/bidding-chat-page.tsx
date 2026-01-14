"use client";

import React, { useState } from 'react';
// Sửa lại đường dẫn import đúng theo FSD Features
import { 
  BiddingChatCollectionList,
  useBiddingChat 
} from '@/features/bidding-lookup-chat';
import { BiddingChatWindow } from '@/widgets/bidding-chat-window'; 
import { BiddingChatFileList } from '@/widgets/bidding-chat-file-list';

import { Sparkles, FileText, MessageSquare, Server } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const BiddingChatPage = () => {
  // 1. Cập nhật type cho activeTab
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'collections'>('chat');

  return (
    <div className="relative flex flex-col w-full h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] opacity-50" />
      </div>

      {/* Tab Switcher Header */}
      <header className="relative z-20 flex items-center justify-center pt-4 pb-2 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="flex p-1 bg-gray-100 dark:bg-slate-900 rounded-xl shadow-inner border border-gray-200 dark:border-slate-800">
          
          {/* TAB CHAT */}
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
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
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === 'files' 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            )}
          >
            <FileText className="w-4 h-4" />
            Cơ sở dữ liệu
          </button>

          {/* TAB COLLECTIONS [NEW] */}
          <button
            onClick={() => setActiveTab('collections')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
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
        <div className={cn("flex-1 w-full h-full p-4 md:p-6 transition-all duration-300", 
             activeTab === 'chat' ? "block opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4")}>
          <BiddingChatWindow />
        </div>

        {/* VIEW: DOCUMENTS */}
        <div className={cn("flex-1 w-full h-full p-4 md:p-6 transition-all duration-300", 
             activeTab === 'files' ? "block opacity-100 translate-y-0" : "hidden opacity-0 translate-y-4")}>
          <div className="max-w-6xl mx-auto h-full">
            <BiddingChatFileList />
          </div>
        </div>

        {/* VIEW: COLLECTIONS [NEW] */}
        <div className={cn("flex-1 w-full h-full p-4 md:p-6 transition-all duration-300", 
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