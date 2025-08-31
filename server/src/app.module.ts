import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoundsModule } from './modules/rounds/rounds.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UsersModule, AuthModule, RoundsModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
