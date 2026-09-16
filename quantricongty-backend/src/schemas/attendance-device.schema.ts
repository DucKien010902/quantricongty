import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceDeviceDocument = AttendanceDevice & Document;

@Schema({ timestamps: true })
export class AttendanceDevice {
  @Prop({ required: true, default: 'Máy chấm công chính' })
  name: string;

  @Prop({ required: true, default: '192.168.1.201' })
  ip: string;

  @Prop({ required: true, default: 4370 })
  port: number;

  @Prop({ default: 0 })
  commKey: number; // Mật mã kết nối (0 hoặc 123456)

  @Prop({ default: 5 })
  timeout: number; // Giây

  @Prop({ default: 'tcp' })
  protocol: string; // 'tcp' | 'udp'

  @Prop({ default: 'Chưa kết nối' })
  status: string; // 'online' | 'offline' | 'Chưa kết nối'

  @Prop({ default: null })
  lastSyncAt: Date;

  @Prop({ default: 0 })
  lastRecordCount: number;
}

export const AttendanceDeviceSchema = SchemaFactory.createForClass(AttendanceDevice);
