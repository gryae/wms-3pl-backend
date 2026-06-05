"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = exports.LocalStorageDriver = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
let LocalStorageDriver = class LocalStorageDriver {
    constructor(configService) {
        this.configService = configService;
        this.uploadDir = this.configService.get('UPLOAD_PATH', './uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file) {
        const ext = path.extname(file.originalname);
        const hashName = crypto.randomBytes(16).toString('hex') + ext;
        const fullPath = path.join(this.uploadDir, hashName);
        await fs.promises.writeFile(fullPath, file.buffer);
        const port = this.configService.get('PORT', 3001);
        const url = `http://localhost:${port}/uploads/${hashName}`;
        return {
            path: fullPath,
            url,
        };
    }
    async deleteFile(filePath) {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }
};
exports.LocalStorageDriver = LocalStorageDriver;
exports.LocalStorageDriver = LocalStorageDriver = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageDriver);
let FilesService = class FilesService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.driver = new LocalStorageDriver(this.configService);
    }
    async uploadFile(file, uploadedByUserId, entityType, entityId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        let fileType = client_1.FileType.OTHER;
        const mimetype = file.mimetype.toLowerCase();
        if (mimetype.includes('pdf')) {
            fileType = client_1.FileType.PDF;
        }
        else if (mimetype.includes('image')) {
            fileType = client_1.FileType.IMAGE;
        }
        else if (mimetype.includes('excel') ||
            mimetype.includes('sheet') ||
            mimetype.includes('officedocument.spreadsheetml')) {
            fileType = client_1.FileType.EXCEL;
        }
        else if (mimetype.includes('csv')) {
            fileType = client_1.FileType.CSV;
        }
        const { path: filePath, url } = await this.driver.uploadFile(file);
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
    async findOne(id) {
        const file = await this.prisma.fileUpload.findUnique({
            where: { id },
        });
        if (!file) {
            throw new common_1.NotFoundException('File upload metadata not found');
        }
        return file;
    }
    async deleteFile(id) {
        const file = await this.findOne(id);
        await this.driver.deleteFile(file.path);
        await this.prisma.fileUpload.delete({
            where: { id },
        });
        return { message: 'File deleted successfully' };
    }
    async findByEntity(entityType, entityId) {
        return this.prisma.fileUpload.findMany({
            where: {
                entityType,
                entityId,
            },
        });
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map