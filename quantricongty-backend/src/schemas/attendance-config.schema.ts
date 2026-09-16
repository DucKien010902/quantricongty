import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceConfigDocument = AttendanceConfig & Document;

@Schema({ timestamps: true })
export class AttendanceConfig {
  @Prop({ default: '08:00' })
  shiftTimeIn: string; // 8h sáng

  @Prop({ default: '17:00' })
  shiftTimeOut: string; // 5h chiều (17:00)

  @Prop({ default: '12:00' })
  lunchTimeStart: string;

  @Prop({ default: '13:00' })
  lunchTimeEnd: string;

  @Prop({ default: 8.0 })
  workRequiredHours: number; // 8 tiếng làm việc

  @Prop({ default: 1.0 })
  lunchBreakHours: number; // 1 tiếng nghỉ trưa

  @Prop({ default: 60 })
  maxLateFlexMinutes: number; // Muộn nhất 60p (tức đến 9h) được bù giờ

  @Prop({ default: 15 })
  graceMinutes: number; // Cho phép đi muộn không phạt

  @Prop({ default: 8.0 })
  minHoursFullDay: number; // Đủ 8 tiếng = 1.0 công

  @Prop({ default: 4.0 })
  minHoursHalfDay: number; // Từ 4 tiếng = 0.5 công

  @Prop({ default: '09:00' })
  flexLatestIn: string;

  @Prop({ default: '0,6' }) // 0=Chủ Nhật, 6=Thứ Bảy (theo Date.getDay())
  weeklyOffDays: string;
}

export const AttendanceConfigSchema = SchemaFactory.createForClass(AttendanceConfig);


