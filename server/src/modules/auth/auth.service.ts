import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { ENV_JWT_ACCESS_EXPIRES, ENV_JWT_REFRESH_EXPIRES } from '../../common/constants/auth.constants';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const isValid = await verify(user.passwordHash, password);
    return isValid ? user : null;
  }

  async login(username: string, password: string): Promise<Tokens> {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(ENV_JWT_ACCESS_EXPIRES),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(ENV_JWT_REFRESH_EXPIRES),
    });
    return { accessToken, refreshToken };
  }

  async refreshFromPayload(payload: { sub: string; username: string }): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(ENV_JWT_ACCESS_EXPIRES),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(ENV_JWT_REFRESH_EXPIRES),
    });
    return { accessToken, refreshToken };
  }
}


