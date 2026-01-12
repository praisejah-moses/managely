"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "./components/Header";
import { Greeting } from "./components/Greeting";
import { ProjectsCard } from "./components/ProjectsCard";
import { ProjectDetailsModal } from "./components/ProjectDetailsModal";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { GetProjectsApiResponse } from "@/types/index";
import { authApi, projectsApi } from "@/lib/api";
import { useDashboardState } from "./useDashboardState";

function Dash() {
  const {
    open,
    setOpen,
    selected,
    setSelected,
    createOpen,
    setCreateOpen,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    projects,
    setProjects,
    projectsLoading,
    setProjectsLoading,
    projectsError,
    setProjectsError,
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newTasks,
    setNewTasks,
    newPeople,
    setNewPeople,
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
    searchQuery,
    setSearchQuery,
  } = useDashboardState();

  const router = useRouter();

  // Check authentication and fetch projects on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      const cookies = document.cookie.split(";");
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("auth-token=")
      );

      if (!authCookie) {
        router.push("/login?redirect=/dashboard");
        setIsLoading(false);
        setProjectsLoading(false);
        return;
      }

      // Extract token and verify with server
      const token = authCookie.split("=")[1];

      try {
        const response = await authApi.verifyToken(token, { isVerify: true });

        if (response.success && response.data?.user) {
          setIsAuthenticated(true);
          // Update local storage with fresh user data
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Fetch projects immediately after auth success
          try {
            const projectsResponse = await projectsApi.getAll(token);

            if (projectsResponse) {
              setProjects(projectsResponse);
            } else {
              setProjectsError("Failed to load projects");
            }
          } catch (projectError) {
            console.error("Error fetching projects:", projectError);
            setProjectsError("An error occurred while loading projects");
          }
        } else {
          // Token invalid, clear and redirect
          document.cookie = "auth-token=; path=/; max-age=0";
          localStorage.removeItem("user");
          router.push("/login?redirect=/dashboard");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        // On error, redirect to login
        document.cookie = "auth-token=; path=/; max-age=0";
        localStorage.removeItem("user");
        router.push("/login?redirect=/dashboard");
      } finally {
        setIsLoading(false);
        setProjectsLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  // Show loading state while checking authentication and fetching projects
  if (isLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Greeting />
      {projectsError && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{projectsError}</p>
          </div>
        </div>
      )}
      <ProjectsCard
        projects={{
          ...projects,
          data: projects.data.filter((project) => {
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase();
            const nameMatch = project.name?.toLowerCase().includes(query);
            const descMatch = project.description
              ?.toLowerCase()
              .includes(query);
            const taskMatch = project.tasks?.some((task: any) =>
              task.text?.toLowerCase().includes(query)
            );
            const peopleMatch = project.people?.some((person: any) =>
              person.name?.toLowerCase().includes(query)
            );

            return nameMatch || descMatch || taskMatch || peopleMatch;
          }),
        }}
        onProjectSelect={(p) => {
          setSelected(p as any);
          setOpen(true);
        }}
        onNewProject={() => setCreateOpen(true)}
        onProjectComplete={(projectId, completed) => {
          setProjects((cur) => ({
            data:
              cur.data.map((proj) =>
                proj.id === projectId ? { ...proj, completed } : proj
              ) || [],
          }));
          if (selected?.id === projectId) {
            setSelected((prev: any) => ({ ...prev, completed }));
          }
        }}
      />
      <ProjectDetailsModal
        project={selected as unknown as GetProjectsApiResponse}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onUpdateProjects={(updater) => {
          setProjects((cur) => ({
            data: updater(cur.data || []) as any,
          }));
        }}
        onUpdateSelected={setSelected}
        taskInput={taskInput}
        onTaskInputChange={setTaskInput}
        personInput={personInput}
        onPersonInputChange={setPersonInput}
        subtaskInput={subtaskInput}
        onSubtaskInputChange={setSubtaskInput}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
        dependencyTaskId={dependencyTaskId}
        onDependencyChange={setDependencyTaskId}
      />
      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateProject={(project) => {
          setProjects((cur) => ({
            ...cur,
            data: [project as any, ...(cur.data || [])],
          }));
          setCreateOpen(false);
          setNewName("");
          setNewDescription("");
          setNewTasks("");
          setNewPeople("");
        }}
        newName={newName}
        onNameChange={setNewName}
        newDescription={newDescription}
        onDescriptionChange={setNewDescription}
        newTasks={newTasks}
        onTasksChange={setNewTasks}
        newPeople={newPeople}
        onPeopleChange={setNewPeople}
      />
    </main>
  );
}

export default Dash;
