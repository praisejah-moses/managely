import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import morgan = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable HTTP request logging
  app.use(morgan('dev'));

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
    { origin: 'https://managely-by5z.vercel.app',
    credentials: true
     }
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
