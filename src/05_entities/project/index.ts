// File: 05_entities/project/index.ts

// Export Models (Schemas)
export { 
    BiddingProjectSchema, 
    ProjectStatusSchema 
} from './model/model';

// Export Types
export type { 
    BiddingProject, 
    ProjectStatus 
} from './model/model';

// Export APIs
export { 
    getBiddingProjects, 
    createBiddingProject, 
    updateProjectStatus 
} from './api/project.api';