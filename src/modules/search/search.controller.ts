import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Search')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', description: 'Universal search query term' })
  @ApiOperation({ summary: 'Run universal global search across catalog, shipments, returns and manifest records' })
  search(@Query('q') query: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.searchService.search(query, sellerId);
  }
}
