import { Folder } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

export const HistoryFolderGrid = ({ items, onFolderClick }: { items: ResourceItem[], onFolderClick: (f: ResourceItem) => void }) => {
  if (items.length === 0) return null;
  
  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest px-1">Thư mục hồ sơ</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onFolderClick(item)}
            className="group p-4 border border-slate-200 bg-white rounded-xl hover:border-[#009d98]/50 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col items-center text-center gap-2 relative overflow-hidden"
          >
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-[#009d98]/0 group-hover:bg-[#009d98]/5 transition-colors" />
            
            {/* Icon Folder Vàng chuẩn */}
            <Folder className="w-12 h-12 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform drop-shadow-sm mb-1" />
            
            <div className="w-full relative z-10">
               <div className="text-xs font-semibold text-slate-700 group-hover:text-[#009d98] truncate px-1 transition-colors" title={item.name}>
                 {item.name}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};