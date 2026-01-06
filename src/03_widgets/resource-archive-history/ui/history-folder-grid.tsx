import { Folder } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

export const HistoryFolderGrid = ({ items, onFolderClick }: { items: ResourceItem[], onFolderClick: (f: ResourceItem) => void }) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Thư mục hồ sơ</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onFolderClick(item)}
            className="group p-4 border border-slate-200 bg-white rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all text-center"
          >
            <Folder className="w-10 h-10 text-blue-400 mx-auto fill-blue-50 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-slate-700 truncate">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};