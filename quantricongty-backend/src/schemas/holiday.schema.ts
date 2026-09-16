import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true, unique: true, index: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  name: string; // Tên ngày nghỉ (VD: Quốc Khánh 2/9, Tết Dương Lịch...)
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
