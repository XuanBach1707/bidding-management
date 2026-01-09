"use client";
import React, { useState } from 'react';
import { AbacPolicy } from '@/entities/abac';
import { Settings2, Shield, Play, Database, Plus } from "lucide-react";

// Import UI Libs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Sheet, SheetContent } from "@/shared/ui/sheet"; // Dùng Sheet thay cho Div Drawer
import { Button } from "@/shared/ui/button";

// Import Widgets
import { PolicyListTable } from '@/widgets/abac/policy-list';
import { PolicyEditor } from '@/widgets/abac/policy-editor';
import { PolicySimulator } from '@/widgets/abac/policy-simulator';
import { AttributeDictionary } from '@/widgets/abac/attribute-dictionary';

export const AbacConfigPage = () => {
  // State Tabs
  const [activeTab, setActiveTab] = useState("policies");
  
  // State Drawer & Data
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AbacPolicy | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handlers
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
    setRefreshKey(prev => prev + 1); // Refresh list
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50/50 font-sans">
      
      {/* 1. CONTAINER */}
      <div className="container mx-auto max-w-7xl p-6 md:p-8 flex-1 flex flex-col min-h-0">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#009d98]/10 rounded-xl shadow-sm">
                 <Settings2 className="w-6 h-6 text-[#009d98]" />
              </div>
              <div>
                 <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Cấu hình Phân quyền (ABAC)
                 </h1>
                 <p className="text-sm text-slate-500 font-medium">
                    Quản lý chính sách truy cập động và từ điển dữ liệu.
                 </p>
              </div>
           </div>

           {/* Global Action (Chỉ hiện ở Tab Policies) */}
           {activeTab === 'policies' && (
              <Button 
                onClick={handleCreateNew}
                className="bg-[#009d98] hover:bg-[#008580] text-white shadow-sm font-bold gap-2"
              >
                <Plus className="w-5 h-5" /> Tạo Chính Sách Mới
              </Button>
           )}
        </div>

        {/* MAIN TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 space-y-6">
           
           {/* Tab Navigation */}
           <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pb-1">
              <TabsList className="bg-white border border-slate-200 h-12 p-1 w-full sm:w-auto shadow-sm">
                 <TabsTrigger 
                    value="policies" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-10 px-6 font-semibold transition-all gap-2"
                 >
                    <Shield className="w-4 h-4" /> Danh sách Chính sách
                 </TabsTrigger>
                 <TabsTrigger 
                    value="simulator" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-10 px-6 font-semibold transition-all gap-2"
                 >
                    <Play className="w-4 h-4" /> Giả lập (Simulator)
                 </TabsTrigger>
                 <TabsTrigger 
                    value="attributes" 
                    className="data-[state=active]:bg-[#009d98] data-[state=active]:text-white h-10 px-6 font-semibold transition-all gap-2"
                 >
                    <Database className="w-4 h-4" /> Từ điển Attributes
                 </TabsTrigger>
              </TabsList>
           </div>

           {/* Tab Contents */}
           {/* Min-h-0 để scroll hoạt động đúng bên trong các widget con */}
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
        {/* Sử dụng max-w lớn (4xl hoặc 1000px) vì Editor có 2 cột */}
        <SheetContent side="right" className="w-full sm:max-w-[1000px] p-0 border-l border-slate-200 shadow-2xl">
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