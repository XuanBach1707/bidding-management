import { ResourceFileBrowser } from "@/widgets/resource-file-browser";

export const ResourceRepositoryPage = () => {
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] animate-in fade-in duration-300">
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Kho tài liệu chung</h2>
        <p className="text-slate-500 text-sm">Tra cứu và quản lý các văn bản, hồ sơ</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResourceFileBrowser />
      </div>
    </div>
  );
};