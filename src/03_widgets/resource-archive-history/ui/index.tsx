"use client";

import { useState } from "react";
import { BiddingHistoryItem } from "@/entities/resource";
import { ProjectListFeature } from "./project-list-feature";
import { FileBrowserFeature } from "./file-browser-feature";

export const ResourceArchiveHistory = () => {
  // State quản lý xem đang ở chế độ nào
  const [selectedProject, setSelectedProject] = useState<BiddingHistoryItem | null>(null);

  // Handlers
  const handleOpenProject = (project: BiddingHistoryItem) => {
    if (project.folderId) {
      setSelectedProject(project);
    } else {
      alert("Dự án này chưa được liên kết thư mục lưu trữ!");
    }
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10 min-h-[80vh]">
      {selectedProject ? (
        // VIEW 2: MÀN HÌNH DUYỆT FILE
        <FileBrowserFeature 
          rootFolderId={selectedProject.folderId!} // Chắc chắn có vì đã check ở handleOpenProject
          rootProjectName={selectedProject.tenDuAn}
          onBack={handleBackToList}
        />
      ) : (
        // VIEW 1: MÀN HÌNH DANH SÁCH DỰ ÁN
        <ProjectListFeature 
          onOpenProject={handleOpenProject} 
        />
      )}
    </div>
  );
};