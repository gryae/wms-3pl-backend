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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser('id') currentUserId: string) {
    return this.usersService.create(createUserDto, currentUserId);
  }

  @Get()
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Get list of users (filtered and paginated)' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.usersService.findAll(paginationDto, sellerId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile info' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  getPreferences(@CurrentUser('id') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return this.usersService.updatePreferences(userId, dto);
  }

  @Get(':id')
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Get details of a specific user' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Update user details' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.update(id, updateUserDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('users.manage')
  @ApiOperation({ summary: 'Soft-delete a user' })
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.usersService.remove(id, currentUserId);
  }
}
