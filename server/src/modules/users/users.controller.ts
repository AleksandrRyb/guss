import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsString, MinLength } from 'class-validator';
import { hash } from 'argon2';

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
    const passwordHash = await hash(dto.password);
    const user = await this.usersService.createUser(dto.username, passwordHash);
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  @Get('admin/test')
  test() {
    return { ok: true };
  }
}


