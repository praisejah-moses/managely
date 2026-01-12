import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const { tasks, people, ...projectData } = createProjectDto;

    // Handle people - connect to existing or create new
    let peopleConnections: { create?: any[]; connect?: any[] } | undefined =
      undefined;
    if (people && people.length > 0) {
      const peoplePromises = people.map(async (person) => {
        const email = `${person.name.toLowerCase().replace(/\s+/g, '.')}@placeholder.com`;

        // Check if person already exists by email
        const existingPerson = await this.prisma.person.findUnique({
          where: { email },
        });

        if (existingPerson) {
          // Connect to existing person
          return { id: existingPerson.id };
        } else {
          // Create new person
          return {
            name: person.name,
            email: email,
          };
        }
      });

      const resolvedPeople = await Promise.all(peoplePromises);

      // Separate existing (with id) from new (without id)
      const existingPeopleIds = resolvedPeople
        .filter((p) => p.id)
        .map((p) => ({ id: p.id }));
      const newPeople = resolvedPeople.filter((p) => !p.id);

      peopleConnections = {
        create: newPeople,
        connect: existingPeopleIds,
      };
    }

    const project = await this.prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description || 'New project',
        completed: projectData.completed ?? false,
        creatorId: userId,
        // Create tasks if provided
        tasks: tasks
          ? {
              create: tasks.map((task, index) => ({
                text: task.text,
                order: index,
                completed: false,
              })),
            }
          : undefined,
        // Connect to existing people or create new ones
        people: peopleConnections,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
          include: {
            subtasks: true,
            dependsOn: {
              include: {
                dependencyTask: {
                  select: {
                    id: true,
                    text: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        people: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return project;
  }

  async findAll(userId?: string) {
    const where = userId ? { creatorId: userId } : {};

    return this.prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
          include: {
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
          },
          orderBy: {
            order: 'asc',
          },
        },
        people: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            people: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
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
          },
          orderBy: {
            order: 'asc',
          },
        },
        people: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id);

    // Check if user is the creator
    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this project',
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
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
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);

    // Check if user is the creator
    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this project',
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async addPerson(projectId: string, personId: string, userId: string) {
    const project = await this.findOne(projectId);

    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to add people to this project',
      );
    }

    const person = await this.prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    return this.prisma.projectPeople.create({
      data: {
        projectId,
        personId,
      },
      include: {
        person: true,
      },
    });
  }

  async removePerson(projectId: string, personId: string, userId: string) {
    const project = await this.findOne(projectId);

    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to remove people from this project',
      );
    }

    const projectPerson = await this.prisma.projectPeople.findFirst({
      where: {
        projectId,
        personId,
      },
    });

    if (!projectPerson) {
      throw new NotFoundException('Person not found in this project');
    }

    await this.prisma.projectPeople.delete({
      where: { id: projectPerson.id },
    });

    return { message: 'Person removed from project successfully' };
  }
}
