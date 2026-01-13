"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProjectDetailsModalProps, User } from "@/types/index";
import { usersApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import {
  isTaskDependencyCompleted,
  areAllSubtasksCompleted,
  canTaskBeCompleted,
  handleAddTask,
  handleAddSubtask,
  handleAddPerson,
  handleToggleTask,
  handleToggleSubtask,
} from "./projectDetailsHandlers";

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onUpdateProjects,
  onUpdateSelected,
  taskInput,
  onTaskInputChange,
  personInput,
  onPersonInputChange,
  subtaskInput,
  onSubtaskInputChange,
  selectedTaskId,
  onSelectTask,
  dependencyTaskId,
  onDependencyChange,
}: ProjectDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [loadingSubtaskId, setLoadingSubtaskId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Task assignee management state
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await usersApi.getAll(token);
      if (response.success && response.data) {
        setAvailableUsers(response.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return availableUsers;

    const query = userSearchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [availableUsers, userSearchQuery]);

  // Filter users for assignee dropdown - only show people who are on the project
  const filteredAssigneeUsers = useMemo(() => {
    if (!project?.data?.[0]?.projectPeoples) return [];

    // Get list of people on this project
    const projectPeopleEmails = project.data[0].projectPeoples.map((p: any) =>
      p.email?.toLowerCase()
    );

    // Filter available users to only those on the project
    const projectUsers = availableUsers.filter((user) =>
      projectPeopleEmails.includes(user.email.toLowerCase())
    );

    // Apply search filter if there's a query
    if (!assigneeSearchQuery.trim()) return projectUsers;

    const query = assigneeSearchQuery.toLowerCase();
    return projectUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [availableUsers, assigneeSearchQuery, project]);

  if (!isOpen || !project) return null;

  // Extract tasks array from project (flatten the nested array)
  const tasks = project.data[0]?.tasks || [];

  // Handler params for reusable functions
  const handlerParams = {
    projectId: project.data[0].id,
    setLoading,
    setError,
    onUpdateProjects: onUpdateProjects as any,
    onUpdateSelected: onUpdateSelected as any,
  };

  const onAddTask = () => {
    handleAddTask(taskInput, dependencyTaskId, handlerParams, () => {
      onTaskInputChange("");
      onDependencyChange("");
    });
  };

  const onAddSubtask = (taskId: string) => {
    handleAddSubtask(taskId, subtaskInput, handlerParams, () => {
      onSubtaskInputChange("");
      onSelectTask(null);
    });
  };

  const onAddPerson = () => {
    if (!personInput.trim()) return;
    handleAddPerson(personInput, handlerParams, () => {
      onPersonInputChange("");
      setShowUserDropdown(false);
      setUserSearchQuery("");
    });
  };

  const selectUserFromDropdown = (user: User) => {
    onPersonInputChange(user.email);
    setUserSearchQuery(user.email);
    setShowUserDropdown(false);
    // Auto-submit
    handleAddPerson(user.email, handlerParams, () => {
      onPersonInputChange("");
      setUserSearchQuery("");
    });
  };

  const onToggleTask = (taskId: string) => {
    handleToggleTask(taskId, tasks, handlerParams, setLoadingTaskId);
  };

  const onToggleSubtask = (
    taskId: string,
    subtaskId: string,
    currentCompleted: boolean
  ) => {
    handleToggleSubtask(
      taskId,
      subtaskId,
      currentCompleted,
      handlerParams,
      setLoadingSubtaskId
    );
  };

  const onAssignUser = async (taskId: string, userId: string) => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) return;

      const currentAssigneeIds =
        (task as any).assignees?.map((a: any) => a.userId) || [];
      const updatedAssigneeIds = [...currentAssigneeIds, userId];

      const response = await import("@/lib/api").then((mod) =>
        mod.projectsApi.updateTask(token, taskId, {
          assigneeIds: updatedAssigneeIds,
        })
      );

      if (!response.success) {
        setError(response.error || "Failed to assign user");
        setLoading(false);
        return;
      }

      // Refetch project data
      const refetchResponse = await import("@/lib/api").then((mod) =>
        mod.projectsApi.getAll(token)
      );

      if (refetchResponse.data) {
        const currentProject = refetchResponse.data.find(
          (proj: any) => proj.id === project.data[0].id
        );

        if (currentProject) {
          const updatedProject = await import("@/lib/normalizers").then((mod) =>
            mod.normalizeProjectData(currentProject)
          );

          onUpdateProjects((cur: any) =>
            cur.map((proj: any) =>
              proj.id === project.data[0].id ? updatedProject : proj
            )
          );

          onUpdateSelected((s: any) =>
            s?.data?.[0]?.id === project.data[0].id
              ? { data: [updatedProject] }
              : s
          );
        }
      }

      setAssigneeSearchQuery("");
      setAssigningTaskId(null);
      setLoading(false);
    } catch (err) {
      console.error("Error assigning user:", err);
      setError("Failed to assign user");
      setLoading(false);
    }
  };

  const onUnassignUser = async (taskId: string, userId: string) => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) return;

      const currentAssigneeIds =
        (task as any).assignees?.map((a: any) => a.userId) || [];
      const updatedAssigneeIds = currentAssigneeIds.filter(
        (id: string) => id !== userId
      );

      const response = await import("@/lib/api").then((mod) =>
        mod.projectsApi.updateTask(token, taskId, {
          assigneeIds: updatedAssigneeIds,
        })
      );

      if (!response.success) {
        setError(response.error || "Failed to unassign user");
        setLoading(false);
        return;
      }

      // Refetch project data
      const refetchResponse = await import("@/lib/api").then((mod) =>
        mod.projectsApi.getAll(token)
      );

      if (refetchResponse.data) {
        const currentProject = refetchResponse.data.find(
          (proj: any) => proj.id === project.data[0].id
        );

        if (currentProject) {
          const updatedProject = await import("@/lib/normalizers").then((mod) =>
            mod.normalizeProjectData(currentProject)
          );

          onUpdateProjects((cur: any) =>
            cur.map((proj: any) =>
              proj.id === project.data[0].id ? updatedProject : proj
            )
          );

          onUpdateSelected((s: any) =>
            s?.data?.[0]?.id === project.data[0].id
              ? { data: [updatedProject] }
              : s
          );
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error unassigning user:", err);
      setError("Failed to unassign user");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="rounded-xl bg-linear-to-br from-white to-slate-50 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-full">
          {/* Gradient header */}
          <div className="sticky top-0 z-10 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h2
                    className={`text-lg sm:text-2xl font-bold text-white truncate ${
                      project.data[0].completed ? "line-through opacity-70" : ""
                    }`}
                  >
                    {project.data[0].name}
                  </h2>
                  {tasks.length > 0 && tasks.every((t: any) => t.completed) && (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 text-white text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                  Project details and members
                </p>
              </div>
              <button
                aria-label="Close"
                className="shrink-0 text-white/80 hover:text-white transition-colors duration-200 text-xl sm:text-2xl leading-none -mt-1"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Completion progress bar */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600">
                    PROJECT PROGRESS
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    {tasks.filter((t: any) => t.completed).length}/
                    {tasks.length}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{
                      width: `${
                        (tasks.filter((t: any) => t.completed).length /
                          tasks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                Tasks
              </h3>
              <ul className="space-y-4">
                {tasks.map((t: any, idx: number) => {
                  const canComplete = canTaskBeCompleted(t.id, tasks);
                  const isDisabled = !canComplete;
                  const hasDependencies = t.dependsOn && t.dependsOn.length > 0;
                  const hasIncompleteSubtasks = !areAllSubtasksCompleted(t);

                  let disabledReason = "";
                  if (
                    isDisabled &&
                    hasDependencies &&
                    !isTaskDependencyCompleted(t.id, tasks)
                  ) {
                    disabledReason = "Complete dependent task(s) first";
                  } else if (isDisabled && hasIncompleteSubtasks) {
                    disabledReason = "Complete all subtasks first";
                  }

                  return (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 pb-4 border-b border-slate-100 last:border-b-0 group ${
                        t.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div className="relative">
                        {loadingTaskId === t.id ? (
                          <div className="h-5 w-5 mt-0.5 flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => onToggleTask(t.id)}
                            disabled={isDisabled || loadingTaskId !== null}
                            className={`h-5 w-5 mt-0.5 shrink-0 rounded border-slate-300 
                            text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer
                            transition-all duration-200 ${
                              isDisabled || loadingTaskId !== null
                                ? "opacity-50 cursor-not-allowed border-slate-200 hover:border-slate-200"
                                : "hover:border-purple-400"
                            }`}
                            title={
                              isDisabled ? disabledReason : "Mark as complete"
                            }
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm font-medium block group-hover:transition-colors ${
                            t.completed
                              ? "text-slate-500 line-through"
                              : "text-slate-900 group-hover:text-purple-700"
                          }`}
                        >
                          {t.text}
                        </span>

                        {/* Task assignees */}
                        {t.assignees && t.assignees.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-xs text-slate-500">👤</span>
                            {t.assignees.map((assignee: any) => (
                              <div
                                key={assignee.id}
                                className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded px-2 py-0.5 text-xs group/assignee"
                              >
                                <span className="text-purple-700 font-medium">
                                  {assignee.user?.name || "Unknown"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUnassignUser(t.id, assignee.userId)
                                  }
                                  disabled={loading}
                                  className="text-purple-400 hover:text-purple-600 ml-0.5 opacity-0 group-hover/assignee:opacity-100 transition-opacity disabled:opacity-30"
                                  title="Remove assignee"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Assign user section */}
                        {assigningTaskId === t.id ? (
                          <div className="mt-2 relative">
                            <input
                              type="text"
                              value={assigneeSearchQuery}
                              onChange={(e) =>
                                setAssigneeSearchQuery(e.target.value)
                              }
                              placeholder="Search user to assign..."
                              disabled={loading}
                              className="w-full text-xs rounded border border-purple-300 px-2 py-1 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                            />
                            {assigneeSearchQuery && (
                              <div className="absolute z-20 bottom-full mb-1 w-full bg-white border-2 border-purple-200 rounded-lg shadow-xl max-h-32 overflow-y-auto">
                                {filteredAssigneeUsers.length === 0 ? (
                                  <div className="p-2 text-center text-xs text-slate-500">
                                    No users found
                                  </div>
                                ) : (
                                  filteredAssigneeUsers.map((user) => {
                                    const isAssigned = t.assignees?.some(
                                      (a: any) => a.userId === user.id
                                    );
                                    return (
                                      <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => {
                                          if (!isAssigned) {
                                            onAssignUser(t.id, user.id);
                                          }
                                        }}
                                        disabled={isAssigned}
                                        className={`w-full px-2 py-1.5 text-left text-xs hover:bg-purple-50 transition-colors flex items-center gap-2 ${
                                          isAssigned
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }`}
                                      >
                                        <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[10px] font-semibold">
                                          {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="flex-1">
                                          {user.name}
                                        </span>
                                        {isAssigned && (
                                          <span className="text-purple-600">
                                            ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningTaskId(null);
                                setAssigneeSearchQuery("");
                              }}
                              className="text-xs text-slate-500 hover:text-slate-700 mt-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssigningTaskId(t.id)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center gap-1"
                          >
                            + Assign user
                          </button>
                        )}

                        {t.dependsOn && t.dependsOn.length > 0 && (
                          <div
                            className={`text-xs mt-1 rounded px-2 py-1 w-fit ${
                              canComplete
                                ? "text-slate-500 bg-blue-50"
                                : "text-red-600 bg-red-50 font-medium"
                            }`}
                          >
                            🔗 Depends on:{" "}
                            {t.dependsOn
                              .map((dep: any) => {
                                if (dep.dependencyTask) {
                                  return `${dep.dependencyTask.text}${
                                    dep.dependencyTask.completed ? " ✓" : ""
                                  }`;
                                }
                                return "Unknown task";
                              })
                              .join(", ")}
                          </div>
                        )}

                        {t.subtasks.length > 0 && (
                          <ul className="mt-3 ml-4 space-y-2 border-l-2 border-purple-200 pl-3">
                            {t.subtasks.map((sub: any, subIdx: number) => (
                              <li
                                key={subIdx}
                                className={`flex items-center gap-2 group/sub ${
                                  sub.completed ? "opacity-60" : ""
                                }`}
                              >
                                {loadingSubtaskId === sub.id ? (
                                  <div className="h-3 w-3 flex items-center justify-center">
                                    <div className="animate-spin h-2.5 w-2.5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                  </div>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={sub.completed || false}
                                    onChange={() =>
                                      onToggleSubtask(
                                        t.id,
                                        sub.id,
                                        sub.completed || false
                                      )
                                    }
                                    disabled={loadingSubtaskId !== null}
                                    className="h-3 w-3 rounded border-slate-300 text-purple-500 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                )}
                                <span
                                  className={`text-xs transition-all ${
                                    sub.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-600 group-hover/sub:text-purple-600"
                                  }`}
                                >
                                  {sub.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {selectedTaskId === t.id && (
                          <div className="mt-3 flex gap-2 text-sm animate-in slide-in-from-top-2 duration-200">
                            <input
                              value={subtaskInput}
                              onChange={(e) =>
                                onSubtaskInputChange(e.target.value)
                              }
                              placeholder="Add subtask"
                              disabled={loading}
                              className="flex-1 rounded-lg border-2 border-purple-300 px-3 py-1.5 text-xs
                                  focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <Button
                              size="sm"
                              onClick={() => onAddSubtask(t.id)}
                              disabled={loading}
                              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                                  transition-all duration-200 transform hover:scale-105 active:scale-95
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {loading ? "Adding..." : "Add"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                onSelectTask(null);
                                onSubtaskInputChange("");
                              }}
                              disabled={loading}
                              variant="outline"
                              className="border-slate-300 hover:bg-slate-100 text-slate-700
                                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {selectedTaskId !== t.id && (
                          <button
                            type="button"
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 
                            transition-colors duration-200 flex items-center gap-1"
                            onClick={() => onSelectTask(t.id)}
                          >
                            + Add subtask
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 animate-in slide-in-from-left-2 duration-300">
                <input
                  value={taskInput}
                  onChange={(e) => onTaskInputChange(e.target.value)}
                  placeholder="New task"
                  className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm sm:text-base
                    focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                    transition-all duration-200"
                />
                <select
                  value={dependencyTaskId}
                  onChange={(e) => onDependencyChange(e.target.value)}
                  className="rounded-lg border-2 border-slate-200 px-3 py-2 text-xs sm:text-sm
                    focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                    transition-all duration-200 bg-white"
                >
                  <option value="">No dependency</option>
                  {tasks.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      Depends on: {t.text}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={onAddTask}
                  disabled={loading}
                  className="w-full sm:w-auto bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                    transition-all duration-200 transform hover:scale-105 active:scale-95 text-white text-sm
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-pink-600">👥</span>
                People
              </h3>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {project.data[0].projectPeoples.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-linear-to-r from-pink-50 to-pink-100 rounded-lg px-3 py-2 
                    border border-pink-200 transform transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs font-bold text-pink-700">
                        {p.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-900">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-right-2 duration-300">
                  <div className="flex-1 relative">
                    <input
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setShowUserDropdown(true);
                        onPersonInputChange(e.target.value);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      onBlur={() => {
                        // Delay hiding to allow click on dropdown items
                        setTimeout(() => setShowUserDropdown(false), 200);
                      }}
                      placeholder="Search by name or email"
                      disabled={loading}
                      className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm sm:text-base
                        focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {/* Dropdown with filtered users - pops upward */}
                    {showUserDropdown &&
                      userSearchQuery &&
                      filteredUsers.length > 0 && (
                        <div className="absolute z-20 bottom-full mb-1 w-full bg-white border-2 border-pink-200 rounded-lg shadow-xl max-h-40 sm:max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-pink-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {loadingUsers ? (
                            <div className="p-3 text-center text-slate-500">
                              Loading...
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectUserFromDropdown(user);
                                  }}
                                  className="w-full px-2 sm:px-3 py-2 text-left hover:bg-pink-50 active:bg-pink-100 transition-colors flex items-center gap-2"
                                >
                                  <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                                      {user.name}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                                      {user.email}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <Button
                    size="sm"
                    onClick={onAddPerson}
                    disabled={loading || !personInput.trim()}
                    className="w-full sm:w-auto bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700
                      transition-all duration-200 transform hover:scale-105 active:scale-95 text-white text-sm
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Adding..." : "Add Person"}
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">
                  Search for registered users to add to this project
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
