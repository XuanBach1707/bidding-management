import { Folder } from "lucide-react";
import { ResourceItem } from "@/entities/resource";

interface FolderGridProps {
  items: ResourceItem[];
  onFolderClick: (folder: ResourceItem) => void;
}

export const FolderGrid = ({ items, onFolderClick }: FolderGridProps) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
        Thư mục ({items.length})
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onFolderClick(item)}
            className="group p-4 border border-slate-200 bg-white rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition text-center shadow-sm"
          >
            {/* Icon Folder màu vàng đặc trưng */}
            <Folder className="w-12 h-12 text-yellow-400 mx-auto fill-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
            
            <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 truncate px-2">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};