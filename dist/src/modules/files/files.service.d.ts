import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export interface StorageDriver {
    uploadFile(file: Express.Multer.File): Promise<{
        path: string;
        url: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
}
export declare class LocalStorageDriver implements StorageDriver {
    private configService;
    private uploadDir;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<{
        path: string;
        url: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
}
export declare class FilesService {
    private prisma;
    private configService;
    private driver;
    constructor(prisma: PrismaService, configService: ConfigService);
    uploadFile(file: Express.Multer.File, uploadedByUserId?: string, entityType?: string, entityId?: string): Promise<{
        id: string;
        createdAt: Date;
        entityId: string | null;
        size: number;
        path: string;
        url: string;
        filename: string;
        originalName: string;
        mimetype: string;
        fileType: import(".prisma/client").$Enums.FileType;
        entityType: string | null;
        uploadedBy: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        entityId: string | null;
        size: number;
        path: string;
        url: string;
        filename: string;
        originalName: string;
        mimetype: string;
        fileType: import(".prisma/client").$Enums.FileType;
        entityType: string | null;
        uploadedBy: string | null;
    }>;
    deleteFile(id: string): Promise<{
        message: string;
    }>;
    findByEntity(entityType: string, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        entityId: string | null;
        size: number;
        path: string;
        url: string;
        filename: string;
        originalName: string;
        mimetype: string;
        fileType: import(".prisma/client").$Enums.FileType;
        entityType: string | null;
        uploadedBy: string | null;
    }[]>;
}
