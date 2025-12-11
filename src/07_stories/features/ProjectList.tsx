import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton"; // Import Skeleton
import { ChevronRight } from 'lucide-react';
import { ProjectCardData } from '../types/dashboard';
import { cn } from "@/shared/lib/utils";

// Helper styles (Giữ nguyên)
const getStatusColor = (status: ProjectCardData['aiStatus']) => {
  switch (status) {
    case 'ready': return 'bg-green-500 text-green-600';
    case 'limited': return 'bg-orange-500 text-orange-600';
    default: return 'bg-gray-300 text-gray-400';
  }
};

const getStatusLabel = (status: ProjectCardData['aiStatus']) => {
   switch (status) {
    case 'ready': return 'AI Ready';
    case 'limited': return 'AI Limited';
    default: return '';
  }
}

interface ProjectListProps {
  projects?: ProjectCardData[];
  isLoading?: boolean; // Thêm prop isLoading
}

export function ProjectList({ projects, isLoading = false }: ProjectListProps) {
  
  // --- PHẦN SKELETON LOADING ---
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Render 3 cái Skeleton Card giả lập */}
        {[1, 2, 3].map((index) => (
          <Card key={index} className="flex flex-col justify-between shadow-sm border-gray-200 h-full">
            {/* Header Skeleton: Badge + Status */}
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 space-y-0">
              <Skeleton className="h-6 w-24 rounded-md" /> {/* Giả lập Badge Mã TBMT */}
              <div className="flex items-center gap-2">
                 <Skeleton className="h-2 w-2 rounded-full" />
                 <Skeleton className="h-3 w-12" />
              </div>
            </CardHeader>

            {/* Content Skeleton: Title + Investor */}
            <CardContent className="px-6 py-2 flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" /> {/* Dòng 1 tiêu đề */}
                <Skeleton className="h-6 w-2/3" />  {/* Dòng 2 tiêu đề ngắn hơn */}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon người */}
                <Skeleton className="h-4 w-32" /> {/* Tên chủ đầu tư */}
              </div>
            </CardContent>

            {/* Footer Skeleton: Progress Bar Style */}
            <CardFooter className="px-6 pb-6 pt-2">
               <div className="w-full space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
               </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // --- PHẦN RENDER CHÍNH (Giữ nguyên logic cũ) ---
  if (!projects?.length) return <div>Chưa có dự án nào</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border-gray-200">
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 space-y-0">
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 rounded-md font-normal">
              {project.code}
            </Badge>
            {project.aiStatus !== 'none' && (
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className={cn("h-2 w-2 rounded-full", getStatusColor(project.aiStatus).split(' ')[0])} />
                <span className={cn(getStatusColor(project.aiStatus).split(' ')[1])}>
                  {getStatusLabel(project.aiStatus)}
                </span>
              </div>
            )}
            {project.aiStatus === 'none' && (
               <span className="h-2 w-2 rounded-full bg-gray-300" />
            )}
          </CardHeader>

          <CardContent className="px-6 py-2 flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 min-h-[3.5rem]">
              {project.title}
            </h3>
            <div className="flex items-center text-gray-500 text-sm gap-2">
              <span className="shrink-0">👤</span> 
              <span className="truncate">{project.investor}</span>
            </div>
          </CardContent>

          <CardFooter className="px-6 pb-6 pt-2">
            {project.footerType === 'progress' && project.progress ? (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Còn {project.progress.daysLeft} ngày</span>
                  <span className="text-gray-400">{project.progress.percent}%</span>
                </div>
                <Progress value={project.progress.percent} className="h-2 bg-gray-100 [&>div]:bg-green-500" />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-between bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
              >
                {project.action?.label}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}