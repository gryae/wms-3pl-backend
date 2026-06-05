import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, AuditLogService],
  exports: [ProductsService],
})
export class ProductsModule {}
