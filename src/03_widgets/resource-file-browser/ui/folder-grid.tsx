import { Folder, FolderOpen } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

interface FolderGridProps {
  items: ResourceItem[];
  onFolderClick: (folder: ResourceItem) => void;
}

export const FolderGrid = ({ items, onFolderClick }: FolderGridProps) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 md:mb-8">
      <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest px-1 flex items-center gap-2">
        <FolderOpen className="w-4 h-4" /> Thư mục ({items.length})
      </h4>
      
      {/* [UPDATE] Gap nhỏ hơn trên mobile (gap-3) để tiết kiệm chỗ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onFolderClick(item)}
            className="group p-3 md:p-4 border border-slate-200 bg-white rounded-xl hover:border-[#009d98]/50 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col items-center text-center gap-2 md:gap-3 relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[#009d98]/0 group-hover:bg-[#009d98]/5 transition-colors" />
            
            {/* [UPDATE] Icon nhỏ hơn chút trên mobile (w-12 h-12) */}
            <Folder className="w-12 h-12 md:w-14 md:h-14 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform drop-shadow-sm" />
            
            <div className="w-full relative z-10">
               <div className="text-sm font-semibold text-slate-700 group-hover:text-[#009d98] truncate px-1 transition-colors" title={item.name}>
                 {item.name}
               </div>
               <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                 Thư mục
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};