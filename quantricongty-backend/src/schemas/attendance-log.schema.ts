import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceLogDocument = AttendanceLog & Document;

@Schema({ timestamps: true })
export class AttendanceLog {
  @Prop({ required: true, index: true })
  userId: string; // Mã nhân viên (e.g. DHI-001, ĐH0050, 1001, 1, 2...)

  @Prop({ default: '', index: true })
  attendanceCode: string; // Mã chấm công trên máy (VD: 3, 6, 11...)

  @Prop({ default: '' })
  name: string; // Họ tên nhân viên

  @Prop({ required: true, index: true })
  timestamp: string; // YYYY-MM-DD HH:mm:ss

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  time: string; // HH:mm:ss

  @Prop({ default: 0 })
  punch: number; // 0: Vân tay, 1: Khuôn mặt, 2: Thẻ từ, 15: Khác

  @Prop({ default: 0 })
  status: number; // 0: Check-in, 1: Check-out, 4: Overtime...

  @Prop({ default: 'device' })
  source: string; // 'device' | 'excel' | 'manual'

  @Prop({ default: '' })
  deviceIp?: string; // IP máy chấm công
}

export const AttendanceLogSchema = SchemaFactory.createForClass(AttendanceLog);

// Khóa chính kép chống trùng lặp tuyệt đối khi kéo máy hoặc import nhiều lần
AttendanceLogSchema.index({ userId: 1, timestamp: 1 }, { unique: true });
