// API configuration and utilities for server communication

import {
  ApiResponse,
  AuthResponse,
  CreateProjectPayload,
  GetProjectsApiResponse,
  LoginCredentials,
  ProjectResponse,
  SignupCredentials,
  VerifyCredentials,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Generic API call function
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies in requests
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "An error occurred",
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Authentication API calls
export const authApi = {
  // Login user
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiCall<AuthResponse>("/auth", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  signup: async (
    credentials: SignupCredentials
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiCall<AuthResponse>("/auth", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Logout user
  logout: async (): Promise<ApiResponse<void>> => {
    return apiCall("/auth/logout", {
      method: "POST",
    });
  },

  // Verify token and get current user
  verifyToken: async (
    token: string,
    credentials: VerifyCredentials
  ): Promise<ApiResponse<{ user: any }>> => {
    return apiCall("/auth", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get current user profile
  getProfile: async (token: string): Promise<ApiResponse<{ user: any }>> => {
    return apiCall("/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Project-related types

// Import shared normalization functions
import { normalizeProjectData } from "./normalizers";

// Projects API calls
export const projectsApi = {
  // Get all projects
  getAll: async (token: string): Promise<ApiResponse<any>> => {
    const response = await apiCall("/projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Normalize the projects data for client use
    if (response.success && Array.isArray(response.data)) {
      return {
        ...response,
        data: response.data.map((project: any) =>
          normalizeProjectData(project)
        ),
      };
    }

    return response;
  },

  // Create new project
  create: async (
    token: string,
    payload: CreateProjectPayload
  ): Promise<ApiResponse<ProjectResponse>> => {
    return apiCall("/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  // Update project (general updates like name, description, completion status)
  update: async (
    token: string,
    projectId: string,
    updates: Partial<CreateProjectPayload & { completed: boolean }>
  ): Promise<ApiResponse<ProjectResponse>> => {
    return apiCall(`/projects/${projectId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  },

  // Delete project
  delete: async (
    token: string,
    projectId: string
  ): Promise<ApiResponse<void>> => {
    return apiCall(`/tasks/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add task to project
  addTask: async (
    token: string,
    task: {
      text: string;
      projectId: string;
      dependencyTaskIds?: string[];
      assigneeIds?: string[];
    }
  ): Promise<ApiResponse<ProjectResponse>> => {
    return await apiCall(`/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });
  },

  // Update task (toggle completion, update text, etc.)
  updateTask: async (
    token: string,
    taskId: string,
    updates: {
      text?: string;
      completed?: boolean;
      dependencyTaskIds?: string[];
      assigneeIds?: string[];
    }
  ): Promise<ApiResponse<any>> => {
    return apiCall(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  },

  // Add subtask to a task
  addSubtask: async (
    token: string,
    taskId: string,
    subtask: { text: string }
  ): Promise<ApiResponse<any>> => {
    return apiCall(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subtask),
    });
  },

  // Update subtask (toggle completion, update text)
  updateSubtask: async (
    token: string,
    subtaskId: string,
    updates: { text?: string; completed?: boolean }
  ): Promise<ApiResponse<any>> => {
    return apiCall(`/tasks/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  },

  // Add person to project
  addPerson: async (
    token: string,
    projectId: string,
    person: { name: string }
  ): Promise<ApiResponse<ProjectResponse>> => {
    return apiCall(`/projects/${projectId}/people`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(person),
    });
  },
};

// Users API calls
export const usersApi = {
  // Get all users
  getAll: async (token: string): Promise<ApiResponse<any[]>> => {
    return apiCall("/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export { API_BASE_URL };
