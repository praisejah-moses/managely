import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ProjectsCardProps } from "@/types/index";
import { areAllTasksCompleted } from "@/types/helpers";

// Color themes for projects - cycles through these
const colorThemes = [
  {
    bg: "from-blue-50 to-blue-100/50",
    border: "border-blue-200",
    accent: "text-blue-600",
    icon: "bg-blue-100",
  },
  {
    bg: "from-purple-50 to-purple-100/50",
    border: "border-purple-200",
    accent: "text-purple-600",
    icon: "bg-purple-100",
  },
  {
    bg: "from-pink-50 to-pink-100/50",
    border: "border-pink-200",
    accent: "text-pink-600",
    icon: "bg-pink-100",
  },
  {
    bg: "from-green-50 to-green-100/50",
    border: "border-green-200",
    accent: "text-green-600",
    icon: "bg-green-100",
  },
  {
    bg: "from-orange-50 to-orange-100/50",
    border: "border-orange-200",
    accent: "text-orange-600",
    icon: "bg-orange-100",
  },
  {
    bg: "from-teal-50 to-teal-100/50",
    border: "border-teal-200",
    accent: "text-teal-600",
    icon: "bg-teal-100",
  },
];
areAllTasksCompleted;
// Function to get color based on index
const getProjectColor = (index: number) => {
  return colorThemes[index % colorThemes.length];
};

export function ProjectsCard({
  projects,
  onProjectSelect,
  onNewProject,
  onProjectComplete,
}: ProjectsCardProps) {
  return (
    <section
      aria-labelledby="projects-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12"
    >
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <div>
              <CardTitle className="text-lg">Projects</CardTitle>
              <CardDescription>
                Open projects and a quick overview.
              </CardDescription>
            </div>
            <CardAction>
              <Button onClick={onNewProject} size="sm">
                New Project
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            {projects.data.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Get started by creating your first project
                </p>
                <Button onClick={onNewProject} size="sm">
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {projects.data.map((p, index) => {
                  const colors = getProjectColor(index);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onProjectSelect({ data: [p] })}
                      className={`text-left rounded-lg border-2 ${colors.border} bg-linear-to-br ${colors.bg} p-5 
                      transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl hover:-translate-y-1
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      group relative overflow-hidden`}
                    >
                      {/* Animated background glow */}
                      <div
                        className={`absolute -inset-full ${colors.icon} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg blur-2xl`}
                      />

                      <div className="relative z-10">
                        {/* Header with icon indicator and completion checkbox */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={p.completed || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                const allCompleted = areAllTasksCompleted(p);
                                if (allCompleted && onProjectComplete) {
                                  onProjectComplete(p.id, e.target.checked);
                                }
                              }}
                              disabled={!areAllTasksCompleted(p)}
                              title={
                                areAllTasksCompleted(p)
                                  ? "Mark project as complete"
                                  : "Complete all tasks to finish this project"
                              }
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <h3
                              className={`text-sm font-bold ${
                                p.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {p.name}
                            </h3>
                          </div>
                          <div
                            className={`${colors.icon} rounded-full p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}
                          >
                            <svg
                              className={`w-4 h-4 ${colors.accent}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Stats and people */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${colors.icon}`}
                            />
                            <p className="text-xs font-medium text-slate-700">
                              {p.tasks.length} tasks
                            </p>
                          </div>
                          <div className="flex -space-x-2">
                            {p.people.length > 0 ? (
                              <>
                                {p.people
                                  .slice(0, 3)
                                  .map((person: any, idx: number) => (
                                    <Avatar
                                      key={idx}
                                      className="h-6 w-6 border-2 border-white transition-transform duration-300 hover:scale-125 hover:z-10"
                                    >
                                      <AvatarFallback className="text-xs font-semibold">
                                        {person.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                {p.people.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-linear-to-br from-slate-300 to-slate-400 border-2 border-white flex items-center justify-center transition-transform duration-300 hover:scale-125">
                                    <span className="text-xs font-bold text-slate-700">
                                      +{p.people.length - 3}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No people assigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-linear-to-r ${colors.bg} transition-all duration-500`}
                            style={{
                              width: `${
                                p.tasks.length > 0
                                  ? Math.min(
                                      100,
                                      (p.tasks.filter((t: any) => t.completed)
                                        .length /
                                        p.tasks.length) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <p className="text-sm text-slate-600">
              {projects.data.length === 0
                ? "No projects to show"
                : `Showing ${projects.data.length} ${
                    projects.data.length === 1 ? "project" : "projects"
                  }`}
            </p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
