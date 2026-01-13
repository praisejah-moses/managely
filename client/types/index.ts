/*
  Managely - Type Definitions
 */
export interface AuthHandlerParams {
  mode: string;
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  order?: number; // For sorting/ordering subtasks
  taskId?: string; // Foreign key to parent task
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  order?: number; // For sorting/ordering tasks
  projectId?: string; // Foreign key to parent project
  subtasks: Subtask[];
  dependencies: string[]; // Array of task IDs this task depends on (for backward compatibility)
  dependsOn?: Array<{
    // Task dependencies with full information from server
    id?: string;
    dependencyTask: {
      id: string;
      text: string;
      completed: boolean;
    };
  }>;
  assignees?: Array<{
    // Users assigned to this task
    id: string;
    userId: string;
    name?: string;
  }>;
  people?: Person[]; // People assigned to this task
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Person {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  projectPeoples: Person[];
  completed: boolean;
}

export interface ProjectData {
  success: boolean;
  data?: Project[];
  message: string;
}

export interface DashboardState {
  // Data
  projects: Project[];
  selected: Project | null;

  // Modal visibility
  isDetailsModalOpen: boolean;
  isCreateModalOpen: boolean;

  // Form inputs - Create Project
  newProjectName: string;
  newProjectTasks: string;
  newProjectPeople: string;

  // Form inputs - Project Details
  taskInput: string;
  personInput: string;
  subtaskInput: string;
  selectedTaskId: string | null;
  dependencyTaskId: string;
}

export interface ProjectsCardProps {
  projects: GetProjectsApiResponse;
  onProjectSelect: (project: GetProjectsApiResponse) => void;
  onNewProject: () => void;
  onProjectComplete?: (projectId: string, completed: boolean) => void;
  showMyProjectsOnly?: boolean;
  setShowMyProjectsOnly?: (show: boolean) => void;
}

export interface ProjectDetailsModalProps {
  project: GetProjectsApiResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProjects: (updater: (cur: ProjectServerResponse[]) => ProjectServerResponse[]) => void;
  onUpdateSelected: (updater: (s: Project | null) => Project | null) => void;
  taskInput: string;
  onTaskInputChange: (value: string) => void;
  personInput: string;
  onPersonInputChange: (value: string) => void;
  subtaskInput: string;
  onSubtaskInputChange: (value: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  dependencyTaskId: string;
  onDependencyChange: (taskId: string) => void;
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
  newName: string;
  onNameChange: (value: string) => void;
  newDescription: string;
  onDescriptionChange: (value: string) => void;
  newTasks: string;
  onTasksChange: (value: string) => void;
  newPeople: string;
  onPeopleChange: (value: string) => void;
}

export interface ProjectColorScheme {
  bg: string;
  border: string;
  accent: string;
  icon: string;
}

export type ProjectColorMap = Record<string, ProjectColorScheme>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ProjectsApiResponse = ApiResponse<Project[]>;
export type ProjectApiResponse = ApiResponse<Project>;

export interface ProjectServerResponse {
  id: string;
  name: string;
  description: string;
  tasks: Array<{
    id: string;
    text: string;
    subtasks: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
    dependencies: string[];
    dependsOn: string[];
    completed: boolean;
  }>;
  projectPeoples: Array<{
    name: string;
  }>;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetProjectsApiResponse {
  data: Array<ProjectServerResponse>;
  error?: string;
  message?: string;
}

export interface ProjectApiResponseData {
  data: {
    success: boolean;
    data?: ProjectServerResponse;
    error?: string;
    message?: string;
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  tasks?: Array<{
    text: string;
    dependencies?: string[];
  }>;
  people?: Array<{
    name: string;
    email?: string;
  }>;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  tasks: Array<{
    id: string;
    text: string;
    subtasks: any[];
    dependencies: string[];
    completed: boolean;
  }>;
  people: Array<{
    name: string;
  }>;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface VerifyCredentials {
  isVerify?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  isSignup?: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
