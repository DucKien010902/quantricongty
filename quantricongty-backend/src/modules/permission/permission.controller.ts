import { Controller, Get, Post, Body } from '@nestjs/common';
import { PermissionService } from './permission.service.js';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('matrix')
  async getMatrix() {
    return this.permissionService.getMatrix();
  }

  @Post('matrix')
  async saveMatrix(@Body() body: { matrix: any[] }) {
    return this.permissionService.saveMatrix(body.matrix || []);
  }

  @Get('system-admins')
  async getSystemAdmins() {
    return this.permissionService.getSystemAdmins();
  }

  @Post('system-admins')
  async saveSystemAdmins(@Body() body: { systemAdmins: any[] }) {
    return this.permissionService.saveSystemAdmins(body.systemAdmins || []);
  }
}
