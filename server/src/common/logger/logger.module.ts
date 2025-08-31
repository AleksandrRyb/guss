import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'debug',
        autoLogging: true,
        redact: {
          paths: ['req.headers.authorization', 'headers.authorization', 'req.body.password'],
          remove: true,
        },
        serializers: {
          req: (req: any) => ({
            method: req.method,
            url: req.url,
            id: req.id,
            remoteAddress: req.ip ?? req.socket?.remoteAddress,
            userAgent: req.headers?.['user-agent'],
          }),
          res: (res: any) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}


