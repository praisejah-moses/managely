import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsArray()
  @IsOptional()
  assigneeIds?: string[];

  @IsArray()
  @IsOptional()
  dependencyTaskIds?: string[];
}
  