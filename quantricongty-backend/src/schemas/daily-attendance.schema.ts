import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyAttendanceDocument = DailyAttendance & Document;

export enum DailyStatus {
  DU_CONG = 'DU_CONG',         // Đủ công 8h (1.0) - Màu xanh lá #10B981
  THIEU_PHUT = 'THIEU_PHUT',   // Thiếu X phút (0.0) - Màu vàng cam #F59E0B
  THIEU_GIO_VAO = 'THIEU_GIO_VAO', // Quên quẹt vào (0.0) - Màu vàng cam #F59E0B
  THIEU_GIO_RA = 'THIEU_GIO_RA',   // Quên quẹt ra (0.0) - Màu vàng cam #F59E0B
  MISS = 'MISS',               // Vắng mặt (0.0) - Màu đỏ #EF4444
  CUOI_TUAN = 'CUOI_TUAN',     // Nghỉ cuối tuần (0.0) - Màu xám #64748B
  NGHI_LE = 'NGHI_LE',         // Nghỉ lễ / Cty (0.0) - Màu tím #8B5CF6
  NGHI_PHEP = 'NGHI_PHEP',     // Nghỉ phép có lương (1.0) - Màu xanh lam #3B82F6 (Ký hiệu 'P')
}

@Schema({ timestamps: true })
export class DailyAttendance {
  @Prop({ required: true, index: true })
  userId: string; // Mã nhân viên

  @Prop({ default: '' })
  name: string; // Họ tên nhân viên

  @Prop({ default: '' })
  department: string; // Ban / Phòng

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: '' })
  weekday: string; // Thứ Hai, Thứ Ba...

  @Prop({ default: '' })
  firstIn: string; // HH:mm:ss (Giờ vào sớm nhất)

  @Prop({ default: '' })
  lastOut: string; // HH:mm:ss (Giờ ra muộn nhất)

  @Prop({ default: 0 })
  punchCount: number; // Số lần quẹt trong ngày

  @Prop({ default: DailyStatus.MISS, enum: DailyStatus })
  status: string; // Trạng thái tính công

  @Prop({ default: 0 })
  workHours: number; // Số giờ làm việc thực tế (e.g. 8.0, 7.5...)

  @Prop({ default: '0h' })
  workTimeText: string; // Giờ làm việc hiển thị định dạng chuẩn (e.g. "8h 15p", "8h 00p")


  @Prop({ default: 0 })
  missingMinutes: number; // Số phút thiếu (vào muộn + về sớm)

  @Prop({ default: 0 })
  overtimeMinutes: number; // Số phút làm thêm

  @Prop({ default: 0 })
  workCredit: number; // Công ngày (1.0 hoặc 0.0)

  @Prop({ default: '' })
  note: string; // Ghi chú (VD: Đi muộn 15p, Về sớm 20p, Nghỉ lễ, Làm thêm 45p...)
}

export const DailyAttendanceSchema = SchemaFactory.createForClass(DailyAttendance);

// Mỗi nhân viên chỉ có 1 bản ghi tổng hợp cho 1 ngày
DailyAttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
