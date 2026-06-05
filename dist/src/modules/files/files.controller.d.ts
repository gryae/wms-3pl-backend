import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, currentUserId: string, entityType?: string, entityId?: string): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
