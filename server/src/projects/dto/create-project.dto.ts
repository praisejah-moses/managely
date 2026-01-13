import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDto } from '../../people/dto/create-person.dto';

class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsOptional()
  dependencies?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  @IsOptional()
  subtasks?: CreateSubtaskDto[];
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  @IsOptional()
  tasks?: CreateTaskDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto)
  @IsOptional()
  people?: CreatePersonDto[];

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
