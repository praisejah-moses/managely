import { Project } from "@/types/index";
import { projectsApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { normalizeToArray, normalizeProjectData } from "@/lib/normalizers";

// Re-export for backward compatibility
export const normalizeServerProject = normalizeProjectData;
export { normalizeToArray };

export const areAllSubtasksCompleted = (task: any): boolean => {
  // If no subtasks, return true
  if (!task.subtasks || task.subtasks.length === 0) {
    return true;
  }

  // Check if all subtasks are completed
  return task.subtasks.every((subtask: any) => subtask.completed === true);
};

export const isTaskDependencyCompleted = (
  taskId: string,
  tasks: any
): boolean => {
  // Normalize tasks to array format
  const tasksArray = normalizeToArray(tasks);

  const taskDepend = tasksArray.find((t) => t.id === taskId);
  if (!taskDepend || !taskDepend.dependsOn || taskDepend.dependsOn.length === 0)
    return true;

  return taskDepend.dependsOn.every((dep: any) => {
    // Handle both object format (with dependencyTask) and string format (just ID)
    if (typeof dep === "object" && dep.dependencyTask) {
      return dep.dependencyTask.completed ?? false;
    }
    // Fallback: if it's just an ID string, find the task
    const depTask = tasksArray.find((t) => t.id === dep);
    return depTask?.completed ?? false;
  });
};

export const canTaskBeCompleted = (taskId: string, tasks: any): boolean => {
  const tasksArray = normalizeToArray(tasks);
  const task = tasksArray.find((t) => t.id === taskId);

  if (!task) return false;

  // Check if all dependencies are completed
  const dependenciesCompleted = isTaskDependencyCompleted(taskId, tasks);

  // Check if all subtasks are completed
  const subtasksCompleted = areAllSubtasksCompleted(task);

  return dependenciesCompleted && subtasksCompleted;
};

interface HandlerParams {
  projectId: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  onUpdateProjects: (updater: (cur: Project[]) => Project[]) => void;
  onUpdateSelected: (updater: any) => void;
}

export const handleAddTask = async (
  taskInput: string,
  dependencyTaskId: string,
  params: HandlerParams,
  onSuccess: () => void
) => {
  const text = taskInput.trim();
  if (!text) return;

  params.setLoading(true);
  params.setError("");

  try {
    const token = getAuthToken();
    if (!token) {
      params.setError("Authentication required");
      params.setLoading(false);
      return;
    }
    // Call server API to add task
    const response = await projectsApi.addTask(token, {
      text,
      projectId: params.projectId,
      dependencyTaskIds: dependencyTaskId ? [dependencyTaskId] : [],
    });

    if (!response.success || !response.data) {
      params.setError(response.error || "Failed to add task");
      params.setLoading(false);
      return;
    }

    // Refetch project data to ensure we have the latest state
    const refetchResponse = await projectsApi.getAll(token);
    if (!refetchResponse.data) {
      params.setError("Failed to refresh project data");
      params.setLoading(false);
      return;
    }

    // Filter for the current project being added to
    const currentProject = refetchResponse.data.find(
      (proj: any) => proj.id === params.projectId
    );
    if (!currentProject) {
      params.setError("Project not found after refetch");
      params.setLoading(false);
      return;
    }

    // Update local state with fresh server data
    const updatedProject = normalizeServerProject(currentProject);

    params.onUpdateProjects((cur: Project[]) =>
      cur.map((proj) => (proj.id === params.projectId ? updatedProject : proj))
    );

    params.onUpdateSelected((s: any) =>
      s?.data?.[0]?.id === params.projectId ? { data: [updatedProject] } : s
    );

    onSuccess();
    params.setLoading(false);
  } catch (err) {
    console.error("Error adding task:", err);
    params.setError("Failed to add task");
    params.setLoading(false);
  }
};

export const handleAddSubtask = async (
  taskId: string,
  subtaskInput: string,
  params: HandlerParams,
  onSuccess: () => void
) => {
  if (!subtaskInput.trim()) return;

  params.setLoading(true);
  params.setError("");

  try {
    const token = getAuthToken();
    if (!token) {
      params.setError("Authentication required");
      params.setLoading(false);
      return;
    }

    // Call server API to add subtask
    const response = await projectsApi.addSubtask(token, taskId, {
      text: subtaskInput.trim(),
    });

    if (!response.success || !response.data) {
      params.setError(response.error || "Failed to add subtask");
      params.setLoading(false);
      return;
    }

    // Refetch project data to ensure we have the latest state
    const refetchResponse = await projectsApi.getAll(token);
    if (!refetchResponse.data) {
      params.setError("Failed to refresh project data");
      params.setLoading(false);
      return;
    }

    // Filter for the current project being added to
    const currentProject = refetchResponse.data.find(
      (proj: any) => proj.id === params.projectId
    );
    if (!currentProject) {
      params.setError("Project not found after refetch");
      params.setLoading(false);
      return;
    }

    // Update local state with fresh server data
    const updatedProject = normalizeServerProject(currentProject);
    params.onUpdateProjects((cur: Project[]) =>
      cur.map((proj) => (proj.id === params.projectId ? updatedProject : proj))
    );

    params.onUpdateSelected((s: any) =>
      s?.data?.[0]?.id === params.projectId ? { data: [updatedProject] } : s
    );

    onSuccess();
    params.setLoading(false);
  } catch (err) {
    console.error("Error adding subtask:", err);
    params.setError("Failed to add subtask");
    params.setLoading(false);
  }
};

export const handleAddPerson = async (
  personInput: string,
  params: HandlerParams,
  onSuccess: () => void
) => {
  const name = personInput.trim();
  if (!name) return;

  params.setLoading(true);
  params.setError("");

  try {
    const token = getAuthToken();
    if (!token) {
      params.setError("Authentication required");
      params.setLoading(false);
      return;
    }

    // Call server API to add person
    const response = await projectsApi.addPerson(token, params.projectId, {
      name,
    });
    console.log("Response after adding person:", response);
    if (!response.success || !response.data) {
      params.setError(response.error || "Failed to add person");
      params.setLoading(false);
      return;
    }

    // Refetch project data to ensure we have the latest state
    const refetchResponse = await projectsApi.getAll(token);
    console.log("Projects after refetch from adding person:", refetchResponse);
    if (!refetchResponse.data) {
      params.setError("Failed to refresh project data");
      params.setLoading(false);
      return;
    }

    // Filter for the current project
    const currentProject = refetchResponse.data.find(
      (proj: any) => proj.id === params.projectId
    );
    if (!currentProject) {
      params.setError("Project not found after refetch");
      params.setLoading(false);
      return;
    }
    console.log("Current project after refetch:", currentProject);
    // Update local state with fresh server data
    const updatedProject = normalizeServerProject(currentProject);
    console.log("Updated project after normalization:", updatedProject);
    params.onUpdateProjects((cur: Project[]) =>
      cur.map((proj) => (proj.id === params.projectId ? updatedProject : proj))
    );

    params.onUpdateSelected((s: any) =>
      s?.data?.[0]?.id === params.projectId ? { data: [updatedProject] } : s
    );

    onSuccess();
    params.setLoading(false);
  } catch (err) {
    console.error("Error adding person:", err);
    params.setError("Failed to add person");
    params.setLoading(false);
  }
};

export const handleToggleTask = async (
  taskId: string,
  tasks: any,
  params: HandlerParams,
  setLoadingTaskId?: (id: string | null) => void
) => {
  // Normalize tasks to array format
  const tasksArray = normalizeToArray(tasks);
  const task = tasksArray.find((t) => t.id === taskId);
  if (!task) return;

  // Check if dependencies are completed
  const canComplete = isTaskDependencyCompleted(taskId, tasksArray);
  if (!canComplete) return;

  // Check if all subtasks are completed
  const subtasksComplete = areAllSubtasksCompleted(task);
  if (!subtasksComplete && !task.completed) return;

  params.setError("");
  if (setLoadingTaskId) setLoadingTaskId(taskId);

  try {
    const token = getAuthToken();
    if (!token) {
      params.setError("Authentication required");
      if (setLoadingTaskId) setLoadingTaskId(null);
      return;
    }

    // Call server API to toggle task completion
    const response = await projectsApi.updateTask(token, taskId, {
      completed: !task.completed,
    });

    if (!response.success || !response.data) {
      params.setError(response.error || "Failed to update task");
      if (setLoadingTaskId) setLoadingTaskId(null);
      return;
    }

    // Refetch project data to ensure we have the latest state
    const refetchResponse = await projectsApi.getAll(token);
    if (!refetchResponse.data) {
      params.setError("Failed to refresh project data");
      if (setLoadingTaskId) setLoadingTaskId(null);
      return;
    }

    // Filter for the current project
    const currentProject = refetchResponse.data.find(
      (proj: any) => proj.id === params.projectId
    );
    if (!currentProject) {
      params.setError("Project not found after refetch");
      if (setLoadingTaskId) setLoadingTaskId(null);
      return;
    }

    // Update local state with fresh server data
    const updatedProject = normalizeServerProject(currentProject);
    params.onUpdateProjects((cur: Project[]) =>
      cur.map((proj) => (proj.id === params.projectId ? updatedProject : proj))
    );

    params.onUpdateSelected((s: any) =>
      s?.data?.[0]?.id === params.projectId ? { data: [updatedProject] } : s
    );

    if (setLoadingTaskId) setLoadingTaskId(null);
  } catch (err) {
    console.error("Error toggling task:", err);
    params.setError("Failed to update task");
    if (setLoadingTaskId) setLoadingTaskId(null);
  }
};

export const handleToggleSubtask = async (
  taskId: string,
  subtaskId: string,
  currentCompleted: boolean,
  params: HandlerParams,
  setLoadingSubtaskId?: (id: string | null) => void
) => {
  params.setError("");
  if (setLoadingSubtaskId) setLoadingSubtaskId(subtaskId);

  try {
    const token = getAuthToken();
    if (!token) {
      params.setError("Authentication required");
      if (setLoadingSubtaskId) setLoadingSubtaskId(null);
      return;
    }

    // Call server API to toggle subtask completion
    const response = await projectsApi.updateSubtask(token, subtaskId, {
      completed: !currentCompleted,
    });

    if (!response.success || !response.data) {
      params.setError(response.error || "Failed to update subtask");
      if (setLoadingSubtaskId) setLoadingSubtaskId(null);
      return;
    }

    // If unchecking a subtask (was completed, now incomplete), also uncheck the parent task
    if (currentCompleted === true) {
      const taskResponse = await projectsApi.updateTask(token, taskId, {
        completed: false,
      });

      if (!taskResponse.success) {
        console.warn("Failed to update parent task:", taskResponse.error);
        // Continue anyway since subtask was updated successfully
      }
    }

    // Refetch project data to ensure we have the latest state
    const refetchResponse = await projectsApi.getAll(token);
    if (!refetchResponse.data) {
      params.setError("Failed to refresh project data");
      if (setLoadingSubtaskId) setLoadingSubtaskId(null);
      return;
    }

    // Filter for the current project
    const currentProject = refetchResponse.data.find(
      (proj: any) => proj.id === params.projectId
    );
    if (!currentProject) {
      params.setError("Project not found after refetch");
      if (setLoadingSubtaskId) setLoadingSubtaskId(null);
      return;
    }

    // Update local state with fresh server data
    const updatedProject = normalizeServerProject(currentProject);
    params.onUpdateProjects((cur: Project[]) =>
      cur.map((proj) => (proj.id === params.projectId ? updatedProject : proj))
    );

    params.onUpdateSelected((s: any) =>
      s?.data?.[0]?.id === params.projectId ? { data: [updatedProject] } : s
    );

    if (setLoadingSubtaskId) setLoadingSubtaskId(null);
  } catch (err) {
    console.error("Error toggling subtask:", err);
    params.setError("Failed to update subtask");
    if (setLoadingSubtaskId) setLoadingSubtaskId(null);
  }
};
