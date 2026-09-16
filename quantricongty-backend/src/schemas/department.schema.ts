import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  managerName: string;

  @Prop({ default: 0 })
  employeeCount: number;

  @Prop({ default: 'bg-blue-500' })
  color: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
