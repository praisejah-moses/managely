import { Project } from "@/types/index";

/**
 * Helper to normalize data to array format
 * Handles various data formats and converts them to arrays
 */
export const normalizeToArray = <T = any>(data: any): T[] => {
  // If already an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's null or undefined, return empty array
  if (data == null) {
    return [];
  }

  // If it's an object with numeric keys (array-like), convert to array
  if (typeof data === "object") {
    const keys = Object.keys(data);
    const isArrayLike = keys.every((key) => !isNaN(Number(key)));

    if (isArrayLike && keys.length > 0) {
      return Object.values(data);
    }
  }

  // If it's a single item, wrap in array
  return [data];
};

/**
 * Helper to normalize server project data to client Project type
 * Ensures consistent data structure across the application
 */
export const normalizeProjectData = (serverProject: any): Project => {
  return {
    id: serverProject.id || serverProject._id || "",
    name: serverProject.name || "Untitled Project",
    description: serverProject.description || "",
    tasks: Array.isArray(serverProject.tasks)
      ? serverProject.tasks.map((task: any) => ({
          id: task.id || task._id || "",
          text: task.text || "",
          completed: task.completed || false,
          order: task.order ?? 0,
          projectId: task.projectId || serverProject.id,
          subtasks: Array.isArray(task.subtasks)
            ? task.subtasks.map((subtask: any) => ({
                id: subtask.id || subtask._id || "",
                text: subtask.text || "",
                completed: subtask.completed || false,
                order: subtask.order ?? 0,
                taskId: subtask.taskId || task.id,
                createdAt: subtask.createdAt,
                updatedAt: subtask.updatedAt,
              }))
            : [],
          // Preserve dependsOn structure from server (with nested dependencyTask)
          dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
          // Also maintain dependencies array (IDs only) for backward compatibility
          dependencies: Array.isArray(task.dependencies)
            ? task.dependencies
            : Array.isArray(task.dependsOn)
            ? task.dependsOn.map((dep: any) => dep.dependencyTask?.id || dep)
            : [],
          assignees: Array.isArray(task.assignees) ? task.assignees : [],
          people: Array.isArray(task.people) ? task.people : [],
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }))
      : [],
    projectPeoples: Array.isArray(serverProject.projectPeoples)
      ? serverProject.projectPeoples
          .map((pp: any) => ({
            id: pp.person?.id || pp.id,
            name: pp.person?.name || pp.name || "Unknown",
            email: pp.person?.email || pp.email,
            avatar: pp.person?.avatar || pp.avatar,
          }))
          .filter((person: any) => person.name && person.name !== "Unknown")
      : [],
    completed: serverProject.completed || false,
  };
};
