import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HelpCenterService } from './help-center.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Help Center')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpService: HelpCenterService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get help categories listing with active sub-articles' })
  findAllCategories() {
    return this.helpService.findAllCategories();
  }

  @Get('articles')
  @ApiQuery({ name: 'q', required: false, description: 'Bilingual text search query term' })
  @ApiOperation({ summary: 'Search active help articles catalog' })
  findArticles(@Query('q') query?: string) {
    return this.helpService.findArticlesBySlugOrQuery(query);
  }

  @Get('context')
  @ApiQuery({ name: 'page', description: 'Contextual page router association, e.g., /inbound' })
  @ApiOperation({ summary: 'Get contextual help article associated with active layout page path' })
  findContextualHelp(@Query('page') pageRoute: string) {
    return this.helpService.findContextualHelp(pageRoute);
  }

  @Post('articles')
  @RequirePermissions('help.manage')
  @ApiOperation({ summary: 'Create a new help center article (WMS Admin only)' })
  create(@Body() dto: CreateArticleDto, @CurrentUser('id') currentUserId: string) {
    return this.helpService.create(dto, currentUserId);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get help article details' })
  findOne(@Param('id') id: string) {
    return this.helpService.findOne(id);
  }

  @Put('articles/:id')
  @RequirePermissions('help.manage')
  @ApiOperation({ summary: 'Update help article (WMS Admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.helpService.update(id, dto, currentUserId);
  }

  @Delete('articles/:id')
  @RequirePermissions('help.manage')
  @ApiOperation({ summary: 'Delete a help article (WMS Admin only)' })
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.helpService.remove(id, currentUserId);
  }
}
