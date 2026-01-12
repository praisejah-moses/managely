"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProjectDetailsModalProps } from "@/types/index";
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

  if (!isOpen || !project) return null;

  // Extract tasks array from project (flatten the nested array)
  const tasks = project.data[0]?.tasks || [];

  // Handler params for reusable functions
  const handlerParams = {
    projectId: project.data[0].id,
    setLoading,
    setError,
    onUpdateProjects,
    onUpdateSelected,
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
    handleAddPerson(personInput, handlerParams, () => {
      onPersonInputChange("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="rounded-xl bg-linear-to-br from-white to-slate-50 shadow-2xl border border-slate-200 overflow-hidden">
          {/* Gradient header */}
          <div className="sticky top-0 z-10 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2
                    className={`text-2xl font-bold text-white ${
                      project.data[0].completed ? "line-through opacity-70" : ""
                    }`}
                  >
                    {project.data[0].name}
                  </h2>
                  {tasks.length > 0 && tasks.every((t: any) => t.completed) && (
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  Project details and members
                </p>
              </div>
              <button
                aria-label="Close"
                className="text-white/80 hover:text-white transition-colors duration-200 text-2xl leading-none"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
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
                  <span className="text-xs font-semibold text-slate-600">
                    PROJECT PROGRESS
                  </span>
                  <span className="text-xs font-bold text-slate-700">
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
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                                const depTask = dep;
                                return depTask
                                  ? `${dep.dependencyTask.text}${
                                      depTask.dependencyTask.completed
                                        ? " ✓"
                                        : ""
                                    }`
                                  : dep;
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

              <div className="mt-4 flex gap-2 animate-in slide-in-from-left-2 duration-300">
                <input
                  value={taskInput}
                  onChange={(e) => onTaskInputChange(e.target.value)}
                  placeholder="New task"
                  className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2
                    focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                    transition-all duration-200"
                />
                <select
                  value={dependencyTaskId}
                  onChange={(e) => onDependencyChange(e.target.value)}
                  className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm
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
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                    transition-all duration-200 transform hover:scale-105 active:scale-95 text-white
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-pink-600">👥</span>
                People
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                {project.data[0].people.map((p: any, i: number) => (
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

              <div className="mt-4 flex gap-2 animate-in slide-in-from-right-2 duration-300">
                <input
                  value={personInput}
                  onChange={(e) => onPersonInputChange(e.target.value)}
                  placeholder="Add person"
                  disabled={loading}
                  className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2
                    focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  size="sm"
                  onClick={onAddPerson}
                  disabled={loading}
                  className="bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700
                    transition-all duration-200 transform hover:scale-105 active:scale-95 text-white
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
