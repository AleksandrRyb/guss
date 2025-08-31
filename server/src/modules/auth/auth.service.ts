import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { verify, hash } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JWT, ROLES } from '../../common/constants/auth.constants';
import { PinoLogger } from 'nestjs-pino';

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
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(username: string, password: string) {
    this.logger.debug({ username }, 'validateUser called');
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      this.logger.debug({ username }, 'validateUser user not found');
      return null;
    }
    const isValid = await verify(user.passwordHash, password);
    this.logger.debug({ username, isValid }, 'validateUser password checked');
    return isValid ? user : null;
  }

  async login(username: string, password: string): Promise<Tokens> {
    this.logger.debug({ username }, 'login called');
    const existing = await this.usersService.findByUsername(username);
    if (!existing) {
      const passwordHash = await hash(password);
      const role = username === 'admin' ? ROLES.admin : username === 'nikita' ? ROLES.nikita : ROLES.user;
      const created = await this.usersService.createUser(username, passwordHash, role);
      this.logger.debug({ username }, 'login auto-created user');
      const tokens = await this.generateTokens({ sub: created.id, username: created.username, role: (created as any).role });
      this.logger.debug({ username }, 'login tokens generated (auto-create)');
      return tokens;
    }
    const isValid = await verify(existing.passwordHash, password);
    this.logger.debug({ username, isValid }, 'login existing user password checked');
    if (!isValid) {
      this.logger.debug({ username }, 'login invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens({ sub: existing.id, username: existing.username, role: (existing as any).role });
    this.logger.debug({ username }, 'login tokens generated');
    return tokens;
  }
  

  async refreshFromPayload(payload: { sub: string; username: string }): Promise<Tokens> {
    this.logger.debug({ sub: payload.sub, username: payload.username }, 'refreshFromPayload called');
    const tokens = await this.generateTokens(payload);
    this.logger.debug({ sub: payload.sub, username: payload.username }, 'refreshFromPayload tokens generated');
    return tokens;
  }

  private async generateTokens(payload: { sub: string; username: string; role?: string }): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(JWT.ENV.ACCESS_EXPIRES),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>(JWT.ENV.REFRESH_EXPIRES),
    });
    return { accessToken, refreshToken };
  }
}


