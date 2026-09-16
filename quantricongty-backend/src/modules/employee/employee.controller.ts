import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { EmployeeService } from './employee.service.js';

interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async getEmployees(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeService.findAll(search, department, status);
  }

  @Get('export-template')
  async exportTemplate(@Res() res: Response) {
    const buffer = await this.employeeService.exportTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Mau_Nhan_Su_DongHaiInvest.xlsx"',
    );
    res.send(buffer);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: UploadedMulterFile) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng đính kèm file Excel (.xlsx)!');
    }
    return this.employeeService.importExcel(file.buffer);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.employeeService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.employeeService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.employeeService.delete(id);
  }

  @Post(':id/send-invite')
  async sendInvite(@Param('id') id: string) {
    return this.employeeService.sendInvite(id);
  }
}
