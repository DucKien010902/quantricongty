import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DepartmentService } from './department.service.js';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly deptService: DepartmentService) {}

  @Get()
  async getDepartments() {
    return this.deptService.getDepartments();
  }

  @Post()
  async createDepartment(@Body() data: any) {
    return this.deptService.createDepartment(data);
  }

  @Put(':id')
  async updateDepartment(@Param('id') id: string, @Body() data: any) {
    return this.deptService.updateDepartment(id, data);
  }

  @Delete(':id')
  async deleteDepartment(@Param('id') id: string) {
    return this.deptService.deleteDepartment(id);
  }
}
