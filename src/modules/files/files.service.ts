import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { FileType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface StorageDriver {
  uploadFile(file: Express.Multer.File): Promise<{ path: string; url: string }>;
  deleteFile(filePath: string): Promise<void>;
}

@Injectable()
export class LocalStorageDriver implements StorageDriver {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_PATH', './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ path: string; url: string }> {
    const ext = path.extname(file.originalname);
    const hashName = crypto.randomBytes(16).toString('hex') + ext;
    const fullPath = path.join(this.uploadDir, hashName);

    await fs.promises.writeFile(fullPath, file.buffer);

    const port = this.configService.get<number>('PORT', 3001);
    const url = `http://localhost:${port}/uploads/${hashName}`;

    return {
      path: fullPath,
      url,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

@Injectable()
export class FilesService {
  private driver: StorageDriver;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Abstraction Layer for Future S3 Migration
    // In the future, we could check config ('STORAGE_PROVIDER' === 'S3') and instantiate S3StorageDriver
    this.driver = new LocalStorageDriver(this.configService);
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedByUserId?: string,
    entityType?: string,
    entityId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Determine FileType enum
    let fileType: FileType = FileType.OTHER;
    const mimetype = file.mimetype.toLowerCase();

    if (mimetype.includes('pdf')) {
      fileType = FileType.PDF;
    } else if (mimetype.includes('image')) {
      fileType = FileType.IMAGE;
    } else if (
      mimetype.includes('excel') ||
      mimetype.includes('sheet') ||
      mimetype.includes('officedocument.spreadsheetml')
    ) {
      fileType = FileType.EXCEL;
    } else if (mimetype.includes('csv')) {
      fileType = FileType.CSV;
    }

    // Call abstraction layer upload
    const { path: filePath, url } = await this.driver.uploadFile(file);

    // Save metadata in database
    const fileUpload = await this.prisma.fileUpload.create({
      data: {
        filename: path.basename(filePath),
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url,
        fileType,
        entityType,
        entityId,
        uploadedBy: uploadedByUserId,
      },
    });

    return fileUpload;
  }

  async findOne(id: string) {
    const file = await this.prisma.fileUpload.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException('File upload metadata not found');
    }
    return file;
  }

  async deleteFile(id: string) {
    const file = await this.findOne(id);

    // Delete physical file via driver
    await this.driver.deleteFile(file.path);

    // Delete database entry
    await this.prisma.fileUpload.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.fileUpload.findMany({
      where: {
        entityType,
        entityId,
      },
    });
  }
}
