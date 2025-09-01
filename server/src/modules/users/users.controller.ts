import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsString, MinLength } from 'class-validator';
import { hash } from 'argon2';
import { ROLES } from '../../common/constants/auth.constants';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const username = dto.username.toLowerCase();
    const passwordHash = await hash(dto.password);
    const role = username === ROLES.admin ? ROLES.admin : username === ROLES.nikita ? ROLES.nikita : ROLES.user;
    const user = await this.usersService.createUser(username, passwordHash, role);
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  @Get('admin/test')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLES.admin)
  test() {
    return { ok: true };
  }
}


