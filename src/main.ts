import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as express from 'express';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  // const port = configService.get<number>('PORT', 3001);
  const port = process.env.PORT || 3001;
  //const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // Static Assets routing for file uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-refresh-token',
    ],
  });

  app.use((req: Request, res: Response, next) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS
  // const allowedOrigins = [
  //   frontendUrl,
  //   'http://localhost:3000',
  //   'http://localhost:3001',
  // ];



  // Global prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WMS 3PL API')
    .setDescription('Enterprise 3PL Warehouse Management System API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Sellers', 'Seller management')
    .addTag('Products', 'Product catalog')
    .addTag('Couriers', 'Courier management')
    .addTag('Inventory', 'Inventory management')
    .addTag('Inbound', 'Inbound management')
    .addTag('Outbound', 'Outbound management')
    .addTag('Picking', 'Picking tasks')
    .addTag('Packing', 'Packing tasks')
    .addTag('Returns', 'Return management')
    .addTag('Manifests', 'Manifest management')
    .addTag('Stock Opname', 'Stock opname')
    .addTag('Reports', 'Reports & exports')
    .addTag('Dashboard', 'Dashboard metrics')
    .addTag('Notifications', 'Notification center')
    .addTag('Search', 'Global search')
    .addTag('Help Center', 'Help articles')
    .addTag('Audit Logs', 'Audit trail')
    .addTag('Files', 'File management')
    .addTag('Settings', 'Warehouse settings')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 WMS Backend running on port ${port}`);
  console.log(`📚 Swagger docs available at /api/docs`);
}

bootstrap();
