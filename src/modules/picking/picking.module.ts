import { Module } from '@nestjs/common';
import { PickingService } from './picking.service';
import { PickingController } from './picking.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [PickingController],
  providers: [PickingService, AuditLogService, NotificationHelperService],
  exports: [PickingService],
})
export class PickingModule {}
