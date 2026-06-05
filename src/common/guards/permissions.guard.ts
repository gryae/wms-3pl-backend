import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Get role permissions from DB
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    const userPermCodes = rolePermissions.map((rp) => rp.permission.code);

    const hasAll = requiredPermissions.every((perm) => userPermCodes.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException(
        `Missing permissions: ${requiredPermissions.filter((p) => !userPermCodes.includes(p)).join(', ')}`,
      );
    }

    return true;
  }
}
