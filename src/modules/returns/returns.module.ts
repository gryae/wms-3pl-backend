import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';

@Module({
  controllers: [ReturnsController],
  providers: [ReturnsService, AuditLogService, NotificationHelperService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
