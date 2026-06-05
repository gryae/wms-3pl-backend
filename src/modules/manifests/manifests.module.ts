import { Module } from '@nestjs/common';
import { ManifestsService } from './manifests.service';
import { ManifestsController } from './manifests.controller';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [ManifestsController],
  providers: [ManifestsService, AuditLogService],
  exports: [ManifestsService],
})
export class ManifestsModule {}
