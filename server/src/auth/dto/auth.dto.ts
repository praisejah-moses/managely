import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  // This field will determine if it's a signup or login
  @IsBoolean()
  @IsOptional()
  isSignup?: boolean;

  // This field will determine if it's a token verification
  @IsBoolean()
  @IsOptional()
  isVerify?: boolean;
}
