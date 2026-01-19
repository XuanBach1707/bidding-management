"use client";
import React, { useState } from 'react';
import { AbacPolicy } from '@/entities/abac';
import { Settings2, Shield, Play, Database, Plus } from "lucide-react";

// Import UI Libs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Sheet, SheetContent } from "@/shared/ui/sheet"; 
import { Button } from "@/shared/ui/button";

// Import Widgets
import { PolicyListTable } from '@/widgets/abac/policy-list';
import { PolicyEditor } from '@/widgets/abac/policy-editor';
import { PolicySimulator } from '@/widgets/abac/policy-simulator';
import { AttributeDictionary } from '@/widgets/abac/attribute-dictionary';

export const AbacConfigPage = () => {
  const [activeTab, setActiveTab] = useState("policies");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AbacPolicy | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = () => {
    setEditingPolicy(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (policy: AbacPolicy) => {
    setEditingPolicy(policy);
    setIsDrawerOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsDrawerOpen(false);
    setRefreshKey(prev => prev + 1); 
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 1. CONTAINER */}
      {/* Mobile: p-4. PC: p-8 */}
      <div className="container mx-auto max-w-7xl p-4 md:p-8 flex-1 flex flex-col min-h-0">
        
        {/* HEADER */}
        {/* Mobile: flex-col items-start gap-4. PC: flex-row items-center */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 shrink-0">
           <div className="flex items-center gap-3">
              <div className="p-2 md:p-2.5 bg-[#009d98]/10 rounded-xl shadow-sm shrink-0">
                 <Settings2 className="w-5 h-5 md:w-6 md:h-6 text-[#009d98]" />
              </div>
              <div>
                 <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
                    Cấu hình Phân quyền (ABAC)
                 </h1>
                 <p className="text-xs md:text-sm text-slate-500 font-medium">
                    Quản lý chính sách truy cập động và từ điển dữ liệu.
                 </p>
              </div>
           </div>

           {/* Global Action */}
           {activeTab === 'policies' && (
              <Button 
                onClick={handleCreateNew}
                className="w-full md:w-auto bg-[#009d98] hover:bg-[#008580] text-white shadow-sm font-bold gap-2"
              >
                <Plus className="w-5 h-5" /> Tạo Chính Sách Mới
              </Button>
           )}
        </div>

        {/* MAIN TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6">
           
           {/* Tab Navigation: Mobile Scroll ngang */}
           <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pb-1 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
              <TabsList className="bg-white border border-slate-200 h-11 md:h-12 p-1 w-max md:w-auto shadow-sm">
                 <TabsTrigger 
                   value="policies" 
                   className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-9 md:h-10 px-4 md:px-6 font-semibold transition-all gap-2 whitespace-nowrap"
                 >
                   <Shield className="w-4 h-4" /> Danh sách Chính sách
                 </TabsTrigger>
                 <TabsTrigger 
                   value="simulator" 
                   className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-9 md:h-10 px-4 md:px-6 font-semibold transition-all gap-2 whitespace-nowrap"
                 >
                   <Play className="w-4 h-4" /> Giả lập (Simulator)
                 </TabsTrigger>
                 <TabsTrigger 
                   value="attributes" 
                   className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-9 md:h-10 px-4 md:px-6 font-semibold transition-all gap-2 whitespace-nowrap"
                 >
                   <Database className="w-4 h-4" /> Từ điển Attributes
                 </TabsTrigger>
              </TabsList>
           </div>

           {/* Tab Contents */}
           <div className="flex-1 min-h-0 relative">
              <TabsContent value="policies" className="mt-0 h-full">
                 <PolicyListTable key={refreshKey} onEdit={handleEdit} />
              </TabsContent>
              
              <TabsContent value="simulator" className="mt-0 h-full">
                 <PolicySimulator />
              </TabsContent>
              
              <TabsContent value="attributes" className="mt-0 h-full">
                 <AttributeDictionary />
              </TabsContent>
           </div>

        </Tabs>

      </div>

      {/* EDITOR DRAWER (SHEET) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {/* Mobile: w-full (chiếm hết). PC: max-w-[1000px] */}
        <SheetContent side="right" className="w-[100vw] sm:max-w-[1000px] p-0 border-l border-slate-200 shadow-2xl">
           {isDrawerOpen && (
             <PolicyEditor 
               initialPolicy={editingPolicy}
               onSuccess={handleSaveSuccess}
               onCancel={() => setIsDrawerOpen(false)}
             />
           )}
        </SheetContent>
      </Sheet>

    </div>
  );
};