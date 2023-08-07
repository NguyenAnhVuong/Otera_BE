import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './core/global/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/global/auth/guards/roles.guard';

import { EConfiguration } from './core/config/configuration.config';
import { UserModule } from './modules/user/user.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { TempleModule } from './modules/temple/temple.module';
import { FamilyModule } from './modules/family/family.module';
import { DeceasedModule } from './modules/deceased/deceased.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
        database: configService.get(EConfiguration.DB_POSTGRESQL_NAME),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        synchronize: true,
        autoLoadEntities: true,
        migrations: ['src/migration/**/*.ts'],
        subscribers: ['src/subscriber/**/*.ts'],
      }),
    }),
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
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
