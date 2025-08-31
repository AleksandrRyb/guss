import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JWT } from '../../../common/constants/auth.constants';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, JWT.STRATEGY) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>(JWT.ENV.SECRET) ?? 'dev-jwt-secret',
    });
  }

  validate(payload: any) {
    return payload;
  }
}


