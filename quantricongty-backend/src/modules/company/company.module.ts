import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../../schemas/company.schema.js';
import { Department, DepartmentSchema } from '../../schemas/department.schema.js';
import { Employee, EmployeeSchema } from '../../schemas/employee.schema.js';
import { CompanyService } from './company.service.js';
import { CompanyController } from './company.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
