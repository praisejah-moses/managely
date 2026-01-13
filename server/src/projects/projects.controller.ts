import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(createProjectDto, user.sub);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @CurrentUser() user?: any) {
    // If userId is not provided, return projects for the current user
    return this.projectsService.findAll(userId || user?.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, user.sub);
  }

  @Post(':id/people')
  @HttpCode(HttpStatus.CREATED)
  addPerson(
    @Param('id') projectId: string,
    @Body() body: { name: string; email?: string },
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addPerson(
      projectId,
      body.email || body.name,
      user.sub,
    );
  }

  @Delete(':projectId/people/:personId')
  removePerson(
    @Param('projectId') projectId: string,
    @Param('personId') personId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removePerson(projectId, personId, user.sub);
  }
}
