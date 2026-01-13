import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    // Check if person with this email already exists
    const existingPerson = await this.prisma.person.findUnique({
      where: { email: createPersonDto.email },
    });

    if (existingPerson) {
      throw new ConflictException(
        `Person with email ${createPersonDto.email} already exists`,
      );
    }

    return this.prisma.person.create({
      data: createPersonDto,
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
    });
  }

  async findAll() {
    return this.prisma.person.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        projectPeoples: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        projectPeoples: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            text: true,
            completed: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return person;
  }

  async findByEmail(email: string) {
    return this.prisma.person.findUnique({
      where: { email },
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
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.person.findUnique({
      where: { userId },
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
    });
  }

  /**
   * Find or create a person profile for a user
   * This is used when adding people to projects
   */
  async findOrCreatePersonByEmail(email: string) {
    // Try to find existing person
    let person = await this.findByEmail(email);

    if (person) {
      return person;
    }

    // Try to find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        `User with email ${email} not found. Only registered users can be added to projects.`,
      );
    }

    // Check if person profile exists for this user
    const existingPerson = await this.findByUserId(user.id);

    if (existingPerson) {
      return existingPerson;
    }

    // Create new person profile for this user
    return this.create({
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar || undefined,
      userId: user.id,
    });
  }

  /**
   * Find or create person by email or ID
   */
  async findOrCreatePerson(emailOrId: string) {
    // Try to find by email first
    let person = await this.findByEmail(emailOrId);

    if (person) {
      return person;
    }

    // Try to find by ID
    try {
      person = await this.findOne(emailOrId);
      return person;
    } catch (error) {
      // Not found by ID, try to create by email
      return this.findOrCreatePersonByEmail(emailOrId);
    }
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    await this.findOne(id); // Check if exists

    // If updating email, check for conflicts
    if (updatePersonDto.email) {
      const existingPerson = await this.prisma.person.findUnique({
        where: { email: updatePersonDto.email },
      });

      if (existingPerson && existingPerson.id !== id) {
        throw new ConflictException(
          `Person with email ${updatePersonDto.email} already exists`,
        );
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: updatePersonDto,
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
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.person.delete({
      where: { id },
    });

    return { message: 'Person deleted successfully' };
  }
}
