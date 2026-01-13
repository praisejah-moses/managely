import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PeopleService } from '../people/people.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private peopleService: PeopleService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const { tasks, people, ...projectData } = createProjectDto;

    // Handle people - only allow registered users to be added as people
    let peopleConnections: { create?: any[] } | undefined = undefined;
    if (people && people.length > 0) {
      const peoplePromises = people.map(async (person) => {
        // Use PeopleService to find or create person by email
        const personRecord = await this.peopleService.findOrCreatePersonByEmail(
          person.email || person.name,
        );
        return personRecord.id;
      });

      const personIds = await Promise.all(peoplePromises);

      // Create ProjectPeople entries
      peopleConnections = {
        create: personIds.map((personId) => ({
          person: { connect: { id: personId } },
        })),
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
                // Create subtasks if provided
                subtasks: task.subtasks
                  ? {
                      create: task.subtasks.map((subtask, subIndex) => ({
                        text: subtask.text,
                        order: subIndex,
                        completed: false,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
        // Create ProjectPeople entries
        projectPeoples: peopleConnections,
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
        projectPeoples: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  async findAll(userId?: string) {
    // Build where clause to find projects where user is creator OR a member
    const where = userId
      ? {
          OR: [
            { creatorId: userId },
            {
              projectPeoples: {
                some: {
                  person: {
                    userId: userId,
                  },
                },
              },
            },
          ],
        }
      : {};

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
        projectPeoples: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                userId: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            projectPeoples: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string) {
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
        projectPeoples: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user has access to this project (creator or member)
    if (userId) {
      const isCreator = project.creatorId === userId;
      const isMember = project.projectPeoples.some(
        (pp) => pp.person.userId === userId,
      );

      if (!isCreator && !isMember) {
        throw new ForbiddenException(
          'You are not authorized to view this project',
        );
      }
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id, userId);

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
    const project = await this.findOne(id, userId);

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

  async addPerson(projectId: string, emailOrId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    if (project.creatorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to add people to this project',
      );
    }

    // Use PeopleService to find or create person
    const person = await this.peopleService.findOrCreatePerson(emailOrId);

    if (!person.userId) {
      throw new ForbiddenException(
        'Only registered users can be added to projects',
      );
    }

    // Check if person is already in the project
    const existingProjectPerson = await this.prisma.projectPeople.findFirst({
      where: {
        projectId,
        personId: person.id,
      },
    });

    if (existingProjectPerson) {
      throw new ForbiddenException('Person is already in this project');
    }

    // Create the project-person relationship
    await this.prisma.projectPeople.create({
      data: {
        projectId,
        personId: person.id,
      },
    });

    // Return the complete updated project
    return this.findOne(projectId, userId);
  }

  async removePerson(projectId: string, personId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

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
