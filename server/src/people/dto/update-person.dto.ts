import { IsString, IsOptional } from 'class-validator';

export class UpdatePersonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
