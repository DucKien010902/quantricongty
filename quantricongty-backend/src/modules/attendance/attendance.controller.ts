import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttendanceService } from './attendance.service.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('daily')
  async getDaily(
    @Query('month') month?: string,
    @Query('userId') userId?: string,
    @Query('department') department?: string,
  ) {
    return this.attendanceService.getDailyAttendance(month, userId, department);
  }

  @Get('monthly-summary')
  async getMonthlySummary(
    @Query('month') month?: string,
    @Query('userId') userId?: string,
    @Query('department') department?: string,
  ) {
    return this.attendanceService.getMonthlySummary(month, userId, department);
  }

  @Get('raw-logs')
  async getRawLogs(
    @Query('month') month?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '100', 10);
    return this.attendanceService.getRawLogs(month, userId, pageNum, limitNum);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn file Excel (.xlsx, .xls) để tải lên.');
    }
    return this.attendanceService.importExcel(file.buffer);
  }

  @Post('device/sync')
  async syncDevice(@Body() body: { ip?: string; port?: number; commKey?: number }) {
    return this.attendanceService.syncFromDevice(body.ip, body.port, body.commKey);
  }

  @Post('device/test-connection')
  async testConnection(@Body() body: { ip?: string; port?: number; commKey?: number }) {
    return this.attendanceService.testConnection(body.ip, body.port, body.commKey);
  }

  @Get('device/config')
  async getDeviceConfig() {
    return this.attendanceService.getDeviceConfig();
  }

  @Post('device/config')
  async saveDeviceConfig(@Body() body: any) {
    return this.attendanceService.saveDeviceConfig(body);
  }

  @Get('config')
  async getConfig() {
    return this.attendanceService.getAttendanceConfig();
  }

  @Post('config')
  async saveConfig(@Body() body: any) {
    return this.attendanceService.saveAttendanceConfig(body);
  }


  @Get('holidays')
  async getHolidays() {
    return this.attendanceService.getHolidays();
  }

  @Post('holidays')
  async createHoliday(@Body() body: { date: string; name: string }) {
    return this.attendanceService.createHoliday(body);
  }

  @Delete('holidays/:id')
  async deleteHoliday(@Param('id') id: string) {
    return this.attendanceService.deleteHoliday(id);
  }

  @Post('seed')
  async seed() {
    return this.attendanceService.seedSeptemberAttendance();
  }

  @Post('clear-all')
  async clearAll() {
    return this.attendanceService.clearAllAttendance();
  }
}
