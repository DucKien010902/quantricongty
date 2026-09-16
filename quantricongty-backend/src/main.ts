import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5002;
  await app.listen(port);
  console.log(`🚀 Dong Hai Invest Backend running on: http://localhost:${port}/api`);
}
await bootstrap();
