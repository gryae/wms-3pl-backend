import { Module } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { CouriersController } from './couriers.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [CouriersController],
  providers: [CouriersService, AuditLogService],
  exports: [CouriersService],
})
export class CouriersModule {}
