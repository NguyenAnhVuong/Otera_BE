import { GQLRolesGuard } from '@core/global/auth/guards/gqlRoles.guard';
import { ConstanceModule } from '@core/global/constance/constance.module';
import { I18nCustomModule } from '@core/global/i18nCustom/i18nCustom.module';
import { QueueProcessorModule } from '@core/global/queueProcessor/queueProcessor.module';
import { HttpExceptionFilter } from '@helper/httpException.filter';
import DatabaseMysqlLogger from '@helper/typeorm.logger';
import { DeathAnniversaryModule } from '@modules/death-anniversary/death-anniversary.module';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';
import { EventModule } from '@modules/event/event.module';
import { FollowerTempleModule } from '@modules/follower-temple/follower-temple.module';
import { InviteFamilyModule } from '@modules/invite-family/invite-family.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { TestModule } from '@modules/test/test.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EConfiguration } from './core/config/configuration.config';
import { JwtAuthGuard } from './core/global/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/global/auth/guards/roles.guard';
import { ResponseInterceptor } from './core/interceptor';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DeceasedModule } from './modules/deceased/deceased.module';
import { FamilyModule } from './modules/family/family.module';
import { TempleModule } from './modules/temple/temple.module';
import { UserModule } from './modules/user/user.module';
import { OfferingModule } from '@modules/offering/offering.module';
import { DeathAnniversaryOfferingModule } from '@modules/death-anniversary-offering/death-anniversary-offering.module';
import { CronjobModule } from '@core/global/schedule/schedule.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get(EConfiguration.DB_POSTGRESQL_HOST),
        port: configService.get<number>(EConfiguration.DB_POSTGRESQL_PORT),
        username: configService.get(EConfiguration.DB_POSTGRESQL_USER),
        password: configService.get(EConfiguration.DB_POSTGRESQL_PASSWORD),
        database: configService.get(EConfiguration.DB_POSTGRESQL_DB),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        synchronize: true,
        autoLoadEntities: true,
        migrations: ['src/core/database/migrations/**/*.ts'],
        subscribers: ['src/subscriber/**/*.ts'],
        logger: new DatabaseMysqlLogger(),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get(EConfiguration.REDIS_HOST),
          port: configService.get(EConfiguration.REDIS_PORT),
        },
      }),
    }),
    I18nCustomModule,
    ConstanceModule,
    UserModule,
    TempleModule,
    FamilyModule,
    DeceasedModule,
    CloudinaryModule,
    TestModule,
    DeathAnniversaryModule,
    EventModule,
    EventParticipantModule,
    FamilyModule,
    NotificationModule,
    InviteFamilyModule,
    NotificationModule,
    FollowerTempleModule,
    QueueProcessorModule,
    OfferingModule,
    DeathAnniversaryOfferingModule,
    CronjobModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GQLRolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
