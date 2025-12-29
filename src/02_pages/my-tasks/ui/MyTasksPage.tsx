"use client";

import { useState } from "react";
import { Task } from "@/entities/task";
import { WorkspaceLayout } from "@/widgets/workspace-board";
import { TaskList } from "@/features/task-list";
import { TaskDetailPanel } from "@/widgets/task-detail";

export const MyTasksPage = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <WorkspaceLayout
      sidebar={
        <TaskList 
          selectedTaskId={selectedTask?.id}
          onSelectTask={setSelectedTask} 
        />
      }
      content={
        <TaskDetailPanel task={selectedTask} />
      }
    />
  );
};