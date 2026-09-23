import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: 'labor', enum: ['labor', 'probation', 'economic', 'service'] })
  category: string;

  @Prop({ default: '' })
  templateId?: string;

  @Prop({ default: '' })
  templateName?: string;

  @Prop({ default: '' })
  employeeId?: string;

  @Prop({ default: '' })
  employeeName?: string;

  @Prop({ required: true })
  partyB: string;

  @Prop({ default: 'employee', enum: ['employee', 'partner'] })
  partyBType: string;

  @Prop({ default: 0 })
  salary?: number;

  @Prop({ default: '' })
  startDate?: string;

  @Prop({ default: '' })
  endDate?: string;

  @Prop({ default: '' })
  signDate?: string;

  @Prop({ default: '' })
  fileUrl: string;

  @Prop({ default: '' })
  objectKey: string;

  @Prop({ default: '0 KB' })
  fileSize: string;

  @Prop({ default: 'active', enum: ['active', 'pending_signature', 'draft', 'expired'] })
  status: string;

  @Prop({ default: 'Ban Pháp Chế' })
  author: string;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
