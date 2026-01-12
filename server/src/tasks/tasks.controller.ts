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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  // @Get()
  // findAll(@Query('projectId') projectId?: string) {
  //   return this.tasksService.findAll(projectId);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.tasksService.findOne(id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.sub);
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // remove(@Param('id') id: string, @CurrentUser() user: any) {
  //   return this.tasksService.remove(id, user.sub);
  // }

  // Subtask endpoints
  @Post(':id/subtasks')
  @HttpCode(HttpStatus.CREATED)
  addSubtask(
    @Param('id') id: string,
    @Body() createSubtaskDto: CreateSubtaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.addSubtask(id, createSubtaskDto, user.sub);
  }

  @Patch('subtasks/:subtaskId')
  updateSubtask(
    @Param('subtaskId') subtaskId: string,
    @Body() data: { text?: string; completed?: boolean },
    @CurrentUser() user: any,
  ) {
    return this.tasksService.updateSubtask(subtaskId, data, user.sub);
  }

  @Delete('subtasks/:subtaskId')
  @HttpCode(HttpStatus.OK)
  removeSubtask(
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.removeSubtask(subtaskId, user.sub);
  }
}
