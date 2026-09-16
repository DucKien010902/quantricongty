import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Approval, ApprovalSchema } from '../../schemas/approval.schema.js';
import { Employee, EmployeeSchema } from '../../schemas/employee.schema.js';
import { DailyAttendance, DailyAttendanceSchema } from '../../schemas/daily-attendance.schema.js';
import { ApprovalService } from './approval.service.js';
import { ApprovalController } from './approval.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Approval.name, schema: ApprovalSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: DailyAttendance.name, schema: DailyAttendanceSchema },
    ]),
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
