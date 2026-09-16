import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service.js';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceLog, AttendanceLogSchema } from '../../schemas/attendance-log.schema.js';
import { DailyAttendance, DailyAttendanceSchema } from '../../schemas/daily-attendance.schema.js';
import { AttendanceDevice, AttendanceDeviceSchema } from '../../schemas/attendance-device.schema.js';
import { Holiday, HolidaySchema } from '../../schemas/holiday.schema.js';
import { AttendanceConfig, AttendanceConfigSchema } from '../../schemas/attendance-config.schema.js';
import { Employee, EmployeeSchema } from '../../schemas/employee.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceLog.name, schema: AttendanceLogSchema },
      { name: DailyAttendance.name, schema: DailyAttendanceSchema },
      { name: AttendanceDevice.name, schema: AttendanceDeviceSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: AttendanceConfig.name, schema: AttendanceConfigSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
