import { Subtask, Task, Person, Project } from "./index";

/**
 * Type Guard Functions
 */

/**
 * Check if an object is a valid Subtask
 */
export function isSubtask(obj: unknown): obj is Subtask {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "text" in obj &&
    "completed" in obj &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).text === "string" &&
    typeof (obj as any).completed === "boolean"
  );
}

/**
 * Check if an object is a valid Task
 */
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "text" in obj &&
    "subtasks" in obj &&
    "dependencies" in obj &&
    "completed" in obj &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).text === "string" &&
    Array.isArray((obj as any).subtasks) &&
    Array.isArray((obj as any).dependencies) &&
    typeof (obj as any).completed === "boolean"
  );
}

/**
 * Check if an object is a valid Person
 */
export function isPerson(obj: unknown): obj is Person {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    typeof (obj as any).name === "string"
  );
}

/**
 * Check if an object is a valid Project
 */
export function isProject(obj: unknown): obj is Project {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "description" in obj &&
    "tasks" in obj &&
    "people" in obj &&
    "completed" in obj &&
    typeof (obj as any).id === "string" &&
    typeof (obj as any).name === "string" &&
    typeof (obj as any).description === "string" &&
    Array.isArray((obj as any).tasks) &&
    Array.isArray((obj as any).people) &&
    typeof (obj as any).completed === "boolean"
  );
}

/**
 * Validation Functions
 */

/**
 * Validate that all tasks in a project are completed
 */
export function areAllTasksCompleted(project: Project): boolean {
  return (
    project.tasks.length > 0 && project.tasks.every((task) => task.completed)
  );
}

/**
 * Validate that all dependencies of a task are completed
 */
export function areDependenciesCompleted(
  task: Task,
  allTasks: Task[]
): boolean {
  if (task.dependencies.length === 0) return true;

  return task.dependencies.every((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return depTask?.completed ?? false;
  });
}

/**
 * Check if a task can be marked complete
 */
export function canTaskBeCompleted(task: Task, allTasks: Task[]): boolean {
  return areDependenciesCompleted(task, allTasks);
}

/**
 * Check if a project can be marked complete
 */
export function canProjectBeCompleted(project: Project): boolean {
  return areAllTasksCompleted(project);
}

/**
 * Factory Functions
 */

/**
 * Create a new Subtask with default values
 */
export function createSubtask(text: string): Subtask {
  return {
    id: Date.now().toString(),
    text,
    completed: false,
  };
}

/**
 * Create a new Task with default values
 */
export function createTask(text: string, dependencies: string[] = []): Task {
  return {
    id: Date.now().toString(),
    text,
    subtasks: [],
    dependencies,
    completed: false,
  };
}

/**
 * Create a new Person with default values
 */
export function createPerson(name: string): Person {
  return { name };
}

/**
 * Create a new Project with default values
 */
export function createProject(
  name: string,
  description: string = "",
  tasks: Task[] = [],
  people: Person[] = []
): Project {
  return {
    id: Date.now().toString(),
    name,
    description,
    tasks,
    people,
    completed: false,
  };
}

/**
 * Parse comma-separated string into Task array
 * Used when creating projects from modal input
 */
export function parseTasksFromString(input: string): Task[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, idx) => ({
      id: `t${idx + 1}`,
      text,
      subtasks: [],
      dependencies: [],
      completed: false,
    }));
}

/**
 * Parse comma-separated string into Person array
 * Used when creating projects from modal input
 */
export function parsePeopleFromString(input: string): Person[] {
  return input
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => createPerson(name));
}
