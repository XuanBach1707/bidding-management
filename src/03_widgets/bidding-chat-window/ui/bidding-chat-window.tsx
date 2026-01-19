"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import { useBiddingChat } from '@/features/bidding-lookup-chat';

export const BiddingChatWindow = () => {
  const { messages, isTyping, sendMessage } = useBiddingChat();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    const query = inputValue;
    setInputValue(""); 
    await sendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Mobile: h-full. PC: max-w-4xl mx-auto rounded-xl border (nếu muốn)
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-background relative md:rounded-xl md:border md:shadow-sm overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-primary/10 rounded-lg">
               <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
             </div>
             <div>
               <h3 className="font-semibold text-sm">Smart Bidding AI</h3>
             </div>
          </div>
      </div>

      {/* MESSAGE LIST AREA */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[80%] text-center space-y-4 animate-in fade-in zoom-in duration-500 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/80" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Tôi có thể giúp gì cho bạn?</h2>
            <p className="text-muted-foreground max-w-md text-xs md:text-sm">
              Tra cứu Luật đấu thầu hoặc phân tích hồ sơ nghiệp vụ chuyên sâu.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex w-full gap-2 md:gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center shrink-0 bg-background mt-1 shadow-sm">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
            )}
            <div className={cn(
              "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 md:px-5 md:py-3 text-sm leading-relaxed shadow-sm",
              msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 text-foreground border rounded-tl-sm"
            )}>
              {msg.role === 'ai' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="break-words whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
           <div className="flex w-full justify-start gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-2">
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center shrink-0 bg-background mt-1 shadow-sm">
               <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
             </div>
             <div className="bg-muted/30 rounded-2xl px-4 py-3 flex items-center gap-1">
               <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-muted-foreground" />
               <span className="text-xs text-muted-foreground ml-1 md:ml-2">AI đang suy nghĩ...</span>
             </div>
           </div>
        )}
        <div ref={scrollRef} className="h-1" /> 
      </div>

      {/* INPUT AREA */}
      <div className="p-3 md:p-4 bg-background/95 backdrop-blur shrink-0 pb-safe md:pb-4">
        <div className="relative flex items-center gap-2 max-w-4xl mx-auto bg-muted/30 border rounded-xl p-1 md:p-2 focus-within:ring-2 focus-within:ring-ring focus-within:bg-background transition-all shadow-sm">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi..."
            // [Mobile Fix] text-base để tránh iOS zoom in khi focus
            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent min-h-[40px] md:min-h-[44px] py-2 text-base md:text-sm"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} size="icon" className="h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-lg">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};