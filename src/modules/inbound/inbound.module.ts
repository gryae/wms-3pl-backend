import { Module } from '@nestjs/common';
import { InboundService } from './inbound.service';
import { InboundController } from './inbound.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [InboundController],
  providers: [InboundService, AuditLogService, NotificationHelperService],
  exports: [InboundService],
})
export class InboundModule {}
