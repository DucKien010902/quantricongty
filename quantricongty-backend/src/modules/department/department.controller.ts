import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
