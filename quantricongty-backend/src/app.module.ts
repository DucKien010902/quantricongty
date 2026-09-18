import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CompanyModule } from './modules/company/company.module.js';
import { DepartmentModule } from './modules/department/department.module.js';
import { EmployeeModule } from './modules/employee/employee.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { ApprovalModule } from './modules/approval/approval.module.js';
import { PermissionModule } from './modules/permission/permission.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://DucKien:kien010902@cluster0.4l1lzw3.mongodb.net/quantricongty?retryWrites=true&w=majority&appName=Cluster0',
    ),
    CompanyModule,
    DepartmentModule,
    EmployeeModule,
    AuthModule,
    AttendanceModule,
    ApprovalModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
