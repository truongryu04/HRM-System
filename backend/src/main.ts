import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Allow FE dev server to call BE APIs (adjust for production as needed)
  app.enableCors({ origin: true, credentials: true });
  // Prefix all routes with /api (e.g. GET /users -> GET /api/users)
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
