import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService, type Tokens } from './auth.service';
import { PinoLogger } from 'nestjs-pino';
import { AuthGuard } from '@nestjs/passport';
import { JWT } from '../../common/constants/auth.constants';

class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly logger: PinoLogger) {
    this.logger.setContext(AuthController.name);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<Tokens> {
    this.logger.debug({ username: dto.username }, 'auth.login called');
    const result = await this.authService.login(dto.username, dto.password);
    this.logger.debug({ username: dto.username }, 'auth.login success');
    return result;
  }

  @Post('refresh')
  @UseGuards(AuthGuard(JWT.REFRESH_STRATEGY))
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: { user: { sub: string; username: string } }): Promise<Tokens> {
    const payload = req.user;
    this.logger.debug({ sub: payload.sub, username: payload.username }, 'auth.refresh called');
    const result = await this.authService.refreshFromPayload(payload);
    this.logger.debug({ sub: payload.sub, username: payload.username }, 'auth.refresh success');
    return result;
  }

  @Get('admin/test')
  test() {
    return { ok: true };
  }
}


