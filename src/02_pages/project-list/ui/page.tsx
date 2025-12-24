"use client";

import { ProjectTaskList } from "@/widgets/project-task-list";

interface ProjectListPageProps {
  projectId: number;
}

export const ProjectListPage = ({ projectId }: ProjectListPageProps) => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Danh sách hạng mục dự án #{projectId}
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý và theo dõi tiến độ các đầu việc trong dự án thầu.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <ProjectTaskList projectId={projectId} />
      </div>
    </div>
  );
};