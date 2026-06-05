import { Module } from '@nestjs/common';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [HelpCenterController],
  providers: [HelpCenterService, AuditLogService],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
