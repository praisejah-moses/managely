import { useState } from "react";
import { Project, GetProjectsApiResponse } from "@/types/index";

export function useDashboardState() {
  // Modal states
  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Projects states
  const [projects, setProjects] = useState<GetProjectsApiResponse>({
    data: [],
    error: "",
    message: "",
  });
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Form input states - Create Project
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTasks, setNewTasks] = useState("");
  const [newPeople, setNewPeople] = useState("");

  // Form input states - Project Details
  const [taskInput, setTaskInput] = useState("");
  const [personInput, setPersonInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [dependencyTaskId, setDependencyTaskId] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  return {
    // Modal states
    open,
    setOpen,
    selected,
    setSelected,
    createOpen,
    setCreateOpen,

    // Authentication states
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,

    // Projects states
    projects,
    setProjects,
    projectsLoading,
    setProjectsLoading,
    projectsError,
    setProjectsError,

    // Form input states - Create Project
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newTasks,
    setNewTasks,
    newPeople,
    setNewPeople,

    // Form input states - Project Details
    taskInput,
    setTaskInput,
    personInput,
    setPersonInput,
    subtaskInput,
    setSubtaskInput,
    selectedTaskId,
    setSelectedTaskId,
    dependencyTaskId,
    setDependencyTaskId,

    // Search state
    searchQuery,
    setSearchQuery,
  };
}
