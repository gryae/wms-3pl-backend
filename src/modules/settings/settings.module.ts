import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, AuditLogService],
  exports: [SettingsService],
})
export class SettingsModule {}
