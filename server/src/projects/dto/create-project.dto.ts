import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsOptional()
  dependencies?: string[];
}

class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  name: string;
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
