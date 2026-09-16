import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../../schemas/employee.schema.js';
import { Company, CompanySchema } from '../../schemas/company.schema.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'quantricongty_secret_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService, MailService],
})
export class AuthModule {}
