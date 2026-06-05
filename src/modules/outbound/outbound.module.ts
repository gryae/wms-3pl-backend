import { Module } from '@nestjs/common';
import { OutboundService } from './outbound.service';
import { OutboundController } from './outbound.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [OutboundController],
  providers: [OutboundService, AuditLogService, NotificationHelperService],
  exports: [OutboundService],
})
export class OutboundModule {}
