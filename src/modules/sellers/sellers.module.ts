import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [SellersController],
  providers: [SellersService, AuditLogService],
  exports: [SellersService],
})
export class SellersModule {}
