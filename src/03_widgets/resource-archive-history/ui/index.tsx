"use client";

import { useState } from "react";
import { BiddingHistoryItem } from "@/entities/resource";
import { ProjectListFeature } from "./project-list-feature";
import { FileBrowserFeature } from "./file-browser-feature";
import { useToast } from "@/shared/lib/hooks/use-toast";

export const ResourceArchiveHistory = () => {
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<BiddingHistoryItem | null>(null);

  // Handlers
  const handleOpenProject = (project: BiddingHistoryItem) => {
    if (project.folderId) {
      setSelectedProject(project);
    } else {
      toast({
        variant: "destructive",
        title: "Chưa liên kết dữ liệu",
        description: "Dự án này chưa có thư mục lưu trữ được kết nối.",
      });
    }
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  return (
    // [UPDATE] gap-4 trên mobile (cho gọn), gap-6 trên desktop
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in duration-500 h-full min-h-[500px]">
      {selectedProject ? (
        // VIEW 2: MÀN HÌNH DUYỆT FILE
        <FileBrowserFeature 
          rootFolderId={selectedProject.folderId!} 
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