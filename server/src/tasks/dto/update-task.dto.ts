import { IsString, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  text?: string;

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
