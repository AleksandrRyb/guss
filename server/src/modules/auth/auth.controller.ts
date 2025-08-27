import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService, type Tokens } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY } from '../../common/constants/auth.constants';

class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('refresh')
  @UseGuards(AuthGuard(JWT_REFRESH_STRATEGY))
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any): Promise<Tokens> {
    const payload = req.user as { sub: string; username: string };
    return this.authService.refreshFromPayload(payload);
  }

  @Get('admin/test')
  test() {
    return { ok: true };
  }
}


