import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const {
      projectId,
      text,
      completed,
      order,
      assigneeIds,
      dependencyTaskIds,
    } = createTaskDto;

    // Verify project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to add tasks to this project',
      );
    }

    // Create task with relations
    const task = await this.prisma.task.create({
      data: {
        text,
        completed: completed ?? false,
        order: order ?? 0,
        projectId,
        assignees: assigneeIds
          ? {
              create: assigneeIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
        dependsOn: dependencyTaskIds
          ? {
              create: dependencyTaskIds.map((dependencyTaskId) => ({
                dependencyTaskId,
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        subtasks: true,
        dependsOn: {
          include: {
            dependencyTask: {
              select: {
                id: true,
                text: true,
                completed: true,
              },
            },
          },
        },
      },
    });

    return task;
  }

  // async findAll(projectId?: string) {
  //   const where = projectId ? { projectId } : {};

  //   return this.prisma.task.findMany({
  //     where,
  //     include: {
  //       assignees: {
  //         include: {
  //           user: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //               avatar: true,
  //             },
  //           },
  //         },
  //       },
  //       subtasks: true,
  //       project: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //       _count: {
  //         select: {
  //           subtasks: true,
  //           dependsOn: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       order: 'asc',
  //     },
  //   });
  // }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        subtasks: {
          orderBy: {
            order: 'asc',
          },
        },
        dependsOn: {
          include: {
            dependencyTask: {
              select: {
                id: true,
                text: true,
                completed: true,
              },
            },
          },
        },
        dependents: {
          include: {
            dependentTask: {
              select: {
                id: true,
                text: true,
                completed: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id);

    // Check if user is the project creator
    if (task.project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this task',
      );
    }

    // Validate: If trying to mark task as complete, check if all subtasks are complete
    if (updateTaskDto.completed === true && task.subtasks.length > 0) {
      const allSubtasksCompleted = task.subtasks.every(
        (subtask) => subtask.completed,
      );
      if (!allSubtasksCompleted) {
        throw new ForbiddenException(
          'Cannot mark task as complete. All subtasks must be completed first.',
        );
      }
    }

    const { assigneeIds, dependencyTaskIds, ...taskData } = updateTaskDto;

    // Update task and relations
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        assignees: assigneeIds
          ? {
              deleteMany: {},
              create: assigneeIds.map((userId) => ({
                userId,
              })),
            }  
          : undefined,
        dependsOn: dependencyTaskIds
          ? {
              deleteMany: {},
              create: dependencyTaskIds.map((dependencyTaskId) => ({
                dependencyTaskId,
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        subtasks: true,
        dependsOn: {
          include: {
            dependencyTask: {
              select: {
                id: true,
                text: true,
                completed: true,
              },
            },
          },
        },
      },
    });

    // Check if all tasks in the project are completed and update project status
    const allTasks = await this.prisma.task.findMany({
      where: { projectId: task.projectId },
    });

    const allTasksCompleted =
      allTasks.length > 0 && allTasks.every((t) => t.completed);

    await this.prisma.project.update({
      where: { id: task.projectId },
      data: { completed: allTasksCompleted },
    });

    return updatedTask;
  }

  // async remove(id: string, userId: string) {
  //   const task = await this.findOne(id);

  //   // Check if user is the project creator
  //   if (task.project.creatorId !== userId) {
  //     throw new ForbiddenException('You are not authorized to delete this task');
  //   }

  //   await this.prisma.task.delete({
  //     where: { id },
  //   });

  //   return { message: 'Task deleted successfully' };
  // }

  async addSubtask(
    taskId: string,
    createSubtaskDto: { text: string; completed?: boolean },
    userId: string,
  ) {
    // Find the task with project relation
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to add subtasks to this task',
      );
    }

    const subtask = await this.prisma.subtask.create({
      data: {
        text: createSubtaskDto.text,
        completed: createSubtaskDto.completed ?? false,
        taskId,
      },
    });

    return subtask;
  }

  async updateSubtask(
    subtaskId: string,
    data: { text?: string; completed?: boolean },
    userId: string,
  ) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
    }

    if (subtask.task.project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this subtask',
      );
    }

    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data,
    });
  }

  async removeSubtask(subtaskId: string, userId: string) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${subtaskId} not found`);
    }

    if (subtask.task.project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this subtask',
      );
    }

    await this.prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return { message: 'Subtask deleted successfully' };
  }
}
