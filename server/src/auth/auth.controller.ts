import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() authDto: AuthDto, @CurrentUser() user?: any) {
    // If isVerify is true, user must be authenticated
    if (authDto.isVerify) {
      if (!user) {
        throw new UnauthorizedException('Authentication required for token verification');
      }
      return this.authService.authenticate(authDto, user.sub);
    }
    
    // For login/signup, make the route public
    return this.authService.authenticate(authDto);
  }
}
