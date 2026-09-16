import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from '../../schemas/department.schema.js';
import { DepartmentService } from './department.service.js';
import { DepartmentController } from './department.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Department.name, schema: DepartmentSchema }]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
