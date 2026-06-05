import { Module } from '@nestjs/common';
import { PackingService } from './packing.service';
import { PackingController } from './packing.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [PackingController],
  providers: [PackingService, AuditLogService, NotificationHelperService],
  exports: [PackingService],
})
export class PackingModule {}
