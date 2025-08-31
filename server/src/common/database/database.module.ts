import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV_DATABASE_URL } from '../constants/auth.constants';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>(ENV_DATABASE_URL);
        const pool = new Pool({ connectionString });
        return drizzle(pool);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}


