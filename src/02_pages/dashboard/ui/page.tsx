"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Plus, X, GripVertical, BarChart3, PieChart as PieIcon, List, Activity, MapPin, ChevronRight, LayoutDashboard 
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";

// Import các Widget đã làm lại
import { 
  RevenueWidget, LocationWidget, FailureReasonWidget, TopOpportunitiesWidget, RoiWidget, SummaryStatsWidget 
} from "./widget";

// --- CẤU HÌNH WIDGET REGISTRY ---
type WidgetType = 'REVENUE' | 'LOCATION' | 'FAILURE' | 'OPPORTUNITIES' | 'ROI';

interface WidgetConfig {
  id: string; 
  type: WidgetType;
  title: string;
  description?: string;
  colSpan: string; 
}

const WIDGET_COMPONENTS: Record<WidgetType, React.FC> = {
  REVENUE: RevenueWidget,
  LOCATION: LocationWidget,
  FAILURE: FailureReasonWidget,
  OPPORTUNITIES: TopOpportunitiesWidget,
  ROI: RoiWidget,
};

const WIDGET_DEFINITIONS: Record<WidgetType, { title: string; description: string; defaultColSpan: string; icon: any }> = {
  REVENUE: { 
    title: "Hiệu quả Đấu thầu", description: "Doanh thu theo tháng (YTD)", 
    defaultColSpan: "col-span-4", icon: BarChart3 
  },
  LOCATION: { 
    title: "Thị trường Trọng điểm", description: "Theo địa lý", 
    defaultColSpan: "col-span-3", icon: MapPin 
  },
  FAILURE: { 
    title: "Phân tích Thất bại", description: "Tỷ lệ rủi ro", 
    defaultColSpan: "col-span-3", icon: PieIcon 
  },
  OPPORTUNITIES: { 
    title: "Đề xuất Thông minh", description: "AI Scoring & Deadline", 
    defaultColSpan: "col-span-4", icon: List 
  },
  ROI: { 
    title: "Hiệu suất ROI", description: "Tỷ suất hoàn vốn", 
    defaultColSpan: "col-span-2", icon: Activity 
  },
};

// --- COMPONENT: SORTABLE ITEM ---
function SortableItem({ item, onRemove }: { item: WidgetConfig; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1, // Làm mờ đi khi kéo để tập trung vào vị trí thả
  };

  const Component = WIDGET_COMPONENTS[item.type];

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${item.colSpan} h-full`}>
      {/* DESIGN SYSTEM: 
         - bg-white: Nổi bật trên nền slate-50
         - border-slate-200: Viền nhẹ
         - shadow-sm: Bóng nhẹ, không gây rối
         - rounded-xl: Bo góc hiện đại
      */}
      <Card className={`h-full border-slate-200 shadow-sm transition-all bg-white overflow-hidden ${isDragging ? 'ring-2 ring-[#009d98] shadow-2xl scale-[1.02]' : 'hover:shadow-md'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b border-slate-50 bg-slate-50/30 space-y-0">
          <div className="flex items-center gap-2">
             {/* Grip chỉ hiện khi hover để giảm nhiễu thị giác (Visual Noise) */}
             <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-slate-200 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity touch-none">
                <GripVertical size={14} />
             </button>
             <div>
                <CardTitle className="text-sm font-bold text-slate-800">{item.title}</CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-medium">{item.description}</CardDescription>
             </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => onRemove(item.id)}>
              <X size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[calc(100%-60px)]">
          <Component />
        </CardContent>
      </Card>
    </div>
  );
}

// --- TRANG CHÍNH ---
export const DashboardPage: React.FC = () => {
  const [items, setItems] = useState<WidgetConfig[]>([
    { id: '1', type: 'REVENUE', title: "Hiệu quả Đấu thầu", description: "Doanh thu theo tháng (YTD)", colSpan: "md:col-span-4" },
    { id: '2', type: 'LOCATION', title: "Thị trường Trọng điểm", description: "Theo địa lý", colSpan: "md:col-span-3" },
    { id: '4', type: 'OPPORTUNITIES', title: "Đề xuất Thông minh", description: "AI Scoring & Deadline", colSpan: "md:col-span-4" },
    { id: '3', type: 'FAILURE', title: "Phân tích Thất bại", description: "Tỷ lệ rủi ro", colSpan: "md:col-span-3" },
  ]);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    const def = WIDGET_DEFINITIONS[type];
    const newId = `${type}-${Date.now()}`;
    const newItem: WidgetConfig = {
      id: newId, type: type, title: def.title, description: def.description, colSpan: `md:${def.defaultColSpan}`, 
    };
    setItems([newItem, ...items]);
  };

  const handleRemoveWidget = (id: string) => setItems(items.filter(i => i.id !== id));

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  return (
    // BG-SLATE-50: Nền xám nhẹ giúp mắt không bị mỏi như nền trắng tinh
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* 1. KHU VỰC CHÍNH */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isLibraryOpen ? 'mr-[380px]' : ''}`}>
        
        {/* Header Dashboard */}
        <div className="flex-none px-8 py-6 pb-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                 <LayoutDashboard className="text-[#009d98]" size={28} />
                 Dashboard Tổng hợp
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1 ml-10">
                 Báo cáo thời gian thực & Phân tích AI
              </p>
            </div>
            
            <Button 
              className={isLibraryOpen 
                 ? "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300" 
                 : "bg-[#009d98] hover:bg-[#008580] text-white shadow-md hover:shadow-lg transition-all"}
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            >
              {isLibraryOpen ? <X size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>}
              {isLibraryOpen ? "Đóng Thư viện" : "Thêm Widget"}
            </Button>
          </div>
          
          {/* PHẦN TỔNG QUAN KPI (Fixed Top) */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <SummaryStatsWidget />
          </div>
        </div>

        {/* PHẦN KÉO THẢ (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar pb-10">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
              {/* Gap-6 rộng rãi hơn để mắt không bị rối */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-6 pb-20"> 
                {items.map((item) => (
                  <SortableItem key={item.id} item={item} onRemove={handleRemoveWidget} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId ? (
                <div className="opacity-90 h-full">
                   <Card className="h-full bg-[#009d98]/5 border-2 border-[#009d98] border-dashed flex items-center justify-center shadow-xl">
                      <span className="text-[#009d98] font-bold animate-pulse">Thả để sắp xếp</span>
                   </Card>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* 2. SIDEBAR THƯ VIỆN WIDGET (Glassmorphism nhẹ) */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[380px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-none">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Thư viện Widget</h2>
              <p className="text-xs text-slate-500 mt-1">Kéo thả hoặc nhấn để thêm.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsLibraryOpen(false)}><ChevronRight size={20} className="text-slate-400" /></Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
            {(Object.keys(WIDGET_DEFINITIONS) as WidgetType[]).map((type) => {
              const def = WIDGET_DEFINITIONS[type];
              return (
                <div key={type} className="group flex flex-col border border-slate-200 rounded-xl overflow-hidden hover:border-[#009d98] hover:shadow-lg hover:translate-y-[-2px] transition-all cursor-pointer bg-white" onClick={() => handleAddWidget(type)}>
                  <div className="px-4 py-3 flex justify-between items-start bg-white border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#009d98]/10 text-[#009d98] rounded-lg group-hover:bg-[#009d98] group-hover:text-white transition-colors">
                        <def.icon size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-800 block">{def.title}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{def.description}</span>
                      </div>
                    </div>
                  </div>
                  {/* Thumbnail giả lập */}
                  <div className="h-24 bg-slate-50 relative flex items-center justify-center">
                      <def.icon size={40} className="text-slate-200 group-hover:text-[#009d98]/20 transition-colors" />
                      <div className="absolute inset-0 bg-[#009d98]/0 group-hover:bg-[#009d98]/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[#009d98] font-bold text-xs uppercase tracking-wider bg-white/90 px-3 py-1 rounded-full shadow-sm">
                             <Plus size={12} className="inline mr-1" /> Thêm
                          </span>
                      </div>
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </div>
  );
};