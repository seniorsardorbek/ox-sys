import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function ManagerOnly() {
  return applyDecorators(
    Roles(UserRole.MANAGER),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
