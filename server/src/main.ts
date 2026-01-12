import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,  
    }),
  );

  // Enable CORS
  app.enableCors(
    { origin: 'http://localhost:3000',
    credentials: true
     }
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
