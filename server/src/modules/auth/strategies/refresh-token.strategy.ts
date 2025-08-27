import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_JWT_REFRESH_SECRET, JWT_REFRESH_STRATEGY } from '../../../common/constants/auth.constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>(ENV_JWT_REFRESH_SECRET) ?? config.get<string>('JWT_SECRET') ?? 'dev-jwt-secret',
    });
  }

  validate(payload: any) {
    return payload;
  }
}


