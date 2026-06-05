import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Files')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string', example: 'inbounds', nullable: true },
        entityId: { type: 'string', example: 'clh8123abc456def789', nullable: true },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a single file (Image, PDF, Excel) and log metadata' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') currentUserId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.filesService.uploadFile(file, currentUserId, entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata information' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file physically and remove metadata log' })
  remove(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}
