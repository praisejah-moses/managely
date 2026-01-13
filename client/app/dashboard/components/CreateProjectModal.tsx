"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CreateProjectModalProps, Project, User } from "@/types/index";
import { parseTasksFromString } from "@/types/helpers";
import { projectsApi, usersApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { normalizeProjectData } from "@/lib/normalizers";
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
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  // Toggle user selection
  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Check if user is selected
  const isUserSelected = (userId: string) => {
    return selectedUsers.some((u) => u.id === userId);
  };

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

      // Use selected users for people
      const people = selectedUsers.map((user) => ({
        name: user.name,
        email: user.email,
      }));

      const payload: CreateProjectPayload = {
        name: newName.trim() || "Untitled Project",
        description: newDescription.trim() || "New project",
        tasks: tasks.map((task) => ({
          text: task.text,
          dependencies: task.dependencies || [],
        })),
        people: people,
      };

      // Call server API
      const response = await projectsApi.create(token, payload);

      if (!response.success || !response.data) {
        setError(response.error || "Failed to create project");
        setLoading(false);
        return;
      }

      // Convert server response to local Project format using normalizer
      const localProject = normalizeProjectData(response.data);

      // Call the parent callback with the created project
      onCreateProject(localProject);

      // Clear form
      onNameChange("");
      onDescriptionChange("");
      onTasksChange("");
      onPeopleChange("");
      setSelectedUsers([]);
      setUserSearchQuery("");
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

            {/* People section with search */}
            <div className="group">
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-pink-600">👥</span>
                Add People to Project
              </label>

              {/* Selected users display */}
              {selectedUsers.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-pink-100 border border-pink-300 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium text-pink-900">
                        {user.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleUserSelection(user)}
                        className="text-pink-600 hover:text-pink-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search input with dropdown */}
              <div className="relative">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onFocus={() => setUserSearchQuery("")}
                  placeholder="Search users by name or email..."
                  className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 pl-10
                    focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200
                    transition-all duration-200 group-hover:border-slate-300
                    bg-white/60 backdrop-blur-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                {/* Dropdown - only shows when there's a search query and results - pops upward */}
                {userSearchQuery && (
                  <div className="absolute z-20 bottom-full mb-1 w-full bg-white border-2 border-pink-200 rounded-lg shadow-xl max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-pink-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {loadingUsers ? (
                      <div className="p-4 text-center text-slate-500">
                        Loading users...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        No users found
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              toggleUserSelection(user);
                              setUserSearchQuery("");
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors duration-200 flex items-center gap-3 ${
                              isUserSelected(user.id) ? "bg-pink-100" : ""
                            }`}
                          >
                            <div className="shrink-0">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 truncate">
                                {user.name}
                              </div>
                              <div className="text-sm text-slate-500 truncate">
                                {user.email}
                              </div>
                            </div>
                            {isUserSelected(user.id) && (
                              <div className="shrink-0 text-pink-600 font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Type to search for users to add to the project
              </p>
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
