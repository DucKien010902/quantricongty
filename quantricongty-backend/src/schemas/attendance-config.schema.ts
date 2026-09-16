import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceConfigDocument = AttendanceConfig & Document;

@Schema({ timestamps: true })
export class AttendanceConfig {
  @Prop({ default: '08:00' })
  shiftTimeIn: string;

  @Prop({ default: '17:00' })
  shiftTimeOut: string;

  @Prop({ default: 8.0 })
  workRequiredHours: number;

  @Prop({ default: 1.0 })
  lunchBreakHours: number;

  @Prop({ default: '09:00' })
  flexLatestIn: string;

  @Prop({ default: '5,6' }) // 5=T7, 6=CN (0=T2)
  weeklyOffDays: string;
}

export const AttendanceConfigSchema = SchemaFactory.createForClass(AttendanceConfig);
