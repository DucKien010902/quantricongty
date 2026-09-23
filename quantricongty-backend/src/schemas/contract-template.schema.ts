import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContractTemplateDocument = ContractTemplate & Document;

@Schema({ timestamps: true })
export class ContractTemplate {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'labor', enum: ['labor', 'probation', 'economic', 'service'] })
  category: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  objectKey: string;

  @Prop({ default: '0 KB' })
  fileSize: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: false })
  isSystemDefault?: boolean;
}

export const ContractTemplateSchema = SchemaFactory.createForClass(ContractTemplate);
