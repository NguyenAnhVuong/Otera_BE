import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './core/global/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/global/auth/guards/roles.guard';

import { ConstanceModule } from '@core/global/constance/constance.module';
import { I18nCustomModule } from '@core/global/i18nCustom/i18nCustom.module';
import { HttpExceptionFilter } from '@helper/httpException.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EConfiguration } from './core/config/configuration.config';
import { ResponseInterceptor } from './core/interceptor';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DeceasedModule } from './modules/deceased/deceased.module';
import { FamilyModule } from './modules/family/family.module';
import { TempleModule } from './modules/temple/temple.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
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
        migrations: ['src/migration/**/*.ts'],
        subscribers: ['src/subscriber/**/*.ts'],
      }),
    }),
    I18nCustomModule,
    ConstanceModule,
    UserModule,
    TempleModule,
    FamilyModule,
    DeceasedModule,
    CloudinaryModule,
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
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
