"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const express = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = process.env.PORT || 3001;
    app.use('/uploads', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
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
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    });
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('WMS 3PL API')
        .setDescription('Enterprise 3PL Warehouse Management System API')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 WMS Backend running on port ${port}`);
    console.log(`📚 Swagger docs available at /api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map