import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: '*',
    credentials: true,
  });
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(new ValidationPipe({ validateCustomDecorators: true }));
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`app is listening on: http://localhost:${PORT}`);
}
bootstrap();
