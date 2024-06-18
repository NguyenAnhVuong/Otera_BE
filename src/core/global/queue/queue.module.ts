import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get(EConfiguration.REDIS_HOST),
          port: +configService.get(EConfiguration.REDIS_PORT),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class QueueModule {}
