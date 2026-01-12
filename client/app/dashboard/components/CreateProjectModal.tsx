"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateProjectModalProps, Project } from "@/types/index";
import { parseTasksFromString, parsePeopleFromString } from "@/types/helpers";
import { projectsApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { CreateProjectPayload } from "@/types/index";

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  newName,
  onNameChange,
  newDescription,
  onDescriptionChange,
  newTasks,
  onTasksChange,
  newPeople,
  onPeopleChange,
}: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to create a project");
        setLoading(false);
        return;
      }

      // Parse the input strings
      const tasks = parseTasksFromString(newTasks);
      const people = parsePeopleFromString(newPeople);

      // Normalize data for server API

      const payload: CreateProjectPayload = {
        name: newName.trim() || "Untitled Project",
        description: newDescription.trim() || "New project",
        tasks: tasks.map((task) => ({
          text: task.text,
          dependencies: task.dependencies || [],
        })),
        people: people.map((person) => ({
          name: person.name,
        })),
      };

      // Call server API
      const response = await projectsApi.create(token, payload);

      if (!response.success || !response.data) {
        setError(response.error || "Failed to create project");
        setLoading(false);
        return;
      }

      // Convert server response to local Project format
      const serverProject = response.data;
      const localProject: Project = {
        id: serverProject.id,
        name: serverProject.name,
        description: serverProject.description,
        tasks: serverProject.tasks.map((task) => ({
          id: task.id,
          text: task.text,
          subtasks: task.subtasks || [],
          dependencies: task.dependencies || [],
          completed: task.completed || false,
        })),
        people: serverProject.people,
        completed: serverProject.completed || false,
      };

      // Call the parent callback with the created project
      onCreateProject(localProject);

      // Clear form
      onNameChange("");
      onDescriptionChange("");
      onTasksChange("");
      onPeopleChange("");
      setLoading(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-linear-to-br from-white to-slate-50 shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header with gradient background */}
          <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Create New Project
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Set up your project with tasks and team members
                </p>
              </div>
              <button
                type="button"
                className="text-white/80 hover:text-white transition-colors duration-200 text-2xl leading-none"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Project name input */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                Project name
              </label>
              <input
                value={newName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g., Website Redesign"
                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  transition-all duration-200 group-hover:border-slate-300
                  bg-white/60 backdrop-blur-sm"
              />
            </div>

            {/* Description textarea */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="e.g., Modernize the landing page with improved UX and responsive design"
                rows={3}
                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  transition-all duration-200 group-hover:border-slate-300
                  bg-white/60 backdrop-blur-sm resize-none"
              />
            </div>

            {/* Tasks input */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                Tasks (comma separated)
              </label>
              <input
                value={newTasks}
                onChange={(e) => onTasksChange(e.target.value)}
                placeholder="e.g., Design mockups, Implement API, Testing"
                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 
                  focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                  transition-all duration-200 group-hover:border-slate-300
                  bg-white/60 backdrop-blur-sm"
              />
            </div>

            {/* People input */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-pink-600">👥</span>
                People (comma separated)
              </label>
              <input
                value={newPeople}
                onChange={(e) => onPeopleChange(e.target.value)}
                placeholder="e.g., Alice, Bob, Carol"
                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 
                  focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200
                  transition-all duration-200 group-hover:border-slate-300
                  bg-white/60 backdrop-blur-sm"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg hover:bg-slate-100 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                  text-white font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95
                  shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Creating..." : "✨ Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
