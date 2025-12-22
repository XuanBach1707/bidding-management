// File: src/02_pages/dashboard/ui/page.tsx
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
  Plus, X, GripVertical, BarChart3, PieChart as PieIcon, List, Activity, MapPin, ChevronRight
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";

// Import các Widget
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
    title: "Hiệu quả Đấu thầu", description: "So sánh trúng/trượt", 
    defaultColSpan: "col-span-4", icon: BarChart3 
  },
  LOCATION: { 
    title: "Top Địa phương", description: "Khu vực tiềm năng", 
    defaultColSpan: "col-span-3", icon: MapPin 
  },
  FAILURE: { 
    title: "Nguyên nhân thất bại", description: "Phân tích rủi ro", 
    defaultColSpan: "col-span-3", icon: PieIcon 
  },
  OPPORTUNITIES: { 
    title: "Cần phê duyệt ngay", description: "Top gói thầu AI đề xuất", 
    defaultColSpan: "col-span-4", icon: List 
  },
  ROI: { 
    title: "Xu hướng ROI", description: "Tỷ lệ hoàn vốn", 
    defaultColSpan: "col-span-2", icon: Activity 
  },
};

// --- COMPONENT: WIDGET PREVIEW ---
const WidgetPreviewThumbnail = ({ type }: { type: WidgetType }) => {
  const Component = WIDGET_COMPONENTS[type];
  const scale = 0.28; 

  return (
    <div className="w-full h-40 bg-slate-50 relative overflow-hidden rounded-b-xl border-t border-slate-100 cursor-pointer">
      <div 
        className="absolute top-0 left-0 origin-top-left bg-white select-none pointer-events-none p-4 shadow-sm"
        style={{ width: '1200px', height: '600px', transform: `scale(${scale})` }}
      >
        <Component />
      </div>
      <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-blue-500/5 transition-colors" />
    </div>
  );
};

// --- COMPONENT: SORTABLE ITEM ---
function SortableItem({ item, onRemove }: { item: WidgetConfig; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.3 : 1,
  };

  const Component = WIDGET_COMPONENTS[item.type];

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${item.colSpan} h-full`}>
      <Card className={`h-full border-slate-200 shadow-sm transition-all bg-white overflow-hidden ${isDragging ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-md'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold flex items-center gap-2">
               <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded text-slate-400 touch-none">
                  <GripVertical size={16} />
              </button>
              {item.title}
            </CardTitle>
            <CardDescription className="text-xs">{item.description}</CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => onRemove(item.id)}>
              <X size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          <Component />
        </CardContent>
      </Card>
    </div>
  );
}

// --- TRANG CHÍNH ---
export const DashboardPage: React.FC = () => {
  const [items, setItems] = useState<WidgetConfig[]>([
    { id: '1', type: 'REVENUE', title: "Hiệu quả Đấu thầu", description: "Doanh thu theo tháng", colSpan: "md:col-span-4" },
    { id: '2', type: 'LOCATION', title: "Top Địa phương", description: "Thị trường trọng điểm", colSpan: "md:col-span-3" },
    { id: '4', type: 'OPPORTUNITIES', title: "Cần phê duyệt", description: "Cơ hội AI đề xuất", colSpan: "md:col-span-4" },
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
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      
      {/* 1. KHU VỰC CHÍNH */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${isLibraryOpen ? 'mr-[400px]' : ''}`}>
        <div className="flex-none p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Tùy chỉnh</h1>
              <p className="text-sm text-slate-500">Kéo widget để sắp xếp. Nhấn "Thư viện" để thêm mới.</p>
            </div>
            <Button 
              className={`${isLibraryOpen ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 hover:bg-blue-700 text-white'} gap-2`}
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            >
              {isLibraryOpen ? <X size={18}/> : <Plus size={18} />}
              {isLibraryOpen ? "Đóng Thư viện" : "Thư viện Widget"}
            </Button>
          </div>
          
          {/* PHẦN TỔNG QUAN KPI CỐ ĐỊNH */}
          <div className="mb-8">
            {/* Đã thêm text Header ở đây */}
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600"/> 
              Tổng quan KPI
            </h3>
            <SummaryStatsWidget />
          </div>
        </div>

        {/* PHẦN KÉO THẢ */}
        <div className="flex-1 overflow-y-auto px-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 pb-20"> 
                {items.map((item) => (
                  <SortableItem key={item.id} item={item} onRemove={handleRemoveWidget} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId ? (
                <div className="opacity-80 h-full">
                   <Card className="h-full bg-blue-50 border-2 border-blue-500 border-dashed flex items-center justify-center">
                      <span className="text-blue-500 font-medium">Đang di chuyển...</span>
                   </Card>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* 2. SIDEBAR THƯ VIỆN WIDGET */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[400px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-none">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Thư viện Widget</h2>
              <p className="text-xs text-slate-500">Nhấn vào widget để thêm vào dashboard.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsLibraryOpen(false)}><ChevronRight size={20} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {(Object.keys(WIDGET_DEFINITIONS) as WidgetType[]).map((type) => {
              const def = WIDGET_DEFINITIONS[type];
              return (
                <div key={type} className="group flex flex-col border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-white" onClick={() => handleAddWidget(type)}>
                  <div className="px-4 py-3 flex justify-between items-start bg-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <def.icon size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 block">{def.title}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{def.description}</span>
                      </div>
                    </div>
                  </div>
                  <WidgetPreviewThumbnail type={type} />
                  <div className="h-0 group-hover:h-10 bg-blue-50 transition-all duration-300 overflow-hidden flex items-center justify-center text-blue-600 text-xs font-bold uppercase tracking-wider">
                     <Plus size={14} className="mr-1" /> Thêm vào Dashboard
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </div>
  );
};