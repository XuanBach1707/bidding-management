"use client";

import { ProjectTaskList } from "@/widgets/project-task-list";

interface ProjectListPageProps {
  projectId: number;
}

export const ProjectListPage = ({ projectId }: ProjectListPageProps) => {
  return (
    // [UPDATE] p-3 trên mobile (để dành đất cho nội dung), p-6 trên desktop
    // gap-4 mobile, gap-6 desktop
    <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 h-full min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 break-words">
          Danh sách hạng mục dự án <span className="text-[#009d98]">#{projectId}</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Quản lý và theo dõi tiến độ các đầu việc trong dự án thầu.
        </p>
      </div>

      {/* CONTENT BOX */}
      {/* [UPDATE] Bỏ p-4 cứng, thay bằng p-0 hoặc p-2 trên mobile để list sát lề hơn */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-0 md:p-4">
           <ProjectTaskList projectId={projectId} />
        </div>
      </div>
    </div>
  );
};