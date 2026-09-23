import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DocumentDocument = CompanyDocument & MongooseDocument;

@Schema({ timestamps: true })
export class CompanyDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ default: 'rules' })
  category: string; // 'rules' | 'contracts' | 'forms' | 'finance' | 'other'

  @Prop({ required: true })
  type: string; // 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'ZIP' | 'IMAGE' | 'OTHER'

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  objectKey: string;

  @Prop({ default: 'Ban Giám Đốc' })
  author: string;

  @Prop()
  description?: string;
}

export const DocumentSchema = SchemaFactory.createForClass(CompanyDocument);
