import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(sellerId?: string): Promise<{
        id: string;
        updatedAt: Date;
        label: string | null;
        key: string;
        value: string;
        group: string | null;
    }[]>;
    update(dto: UpdateSettingsDto, currentUserId: string, sellerId?: string): Promise<any[]>;
}
