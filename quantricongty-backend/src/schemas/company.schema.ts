import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, default: 'Công ty Cổ phần Đầu tư Đông Hải' })
  name: string;

  @Prop({ default: 'DONG HAI INVEST' })
  brandName: string;

  @Prop({ default: '0109988776' })
  taxCode: string;

  @Prop({ default: 'Đầu tư tài chính, Bất động sản và Phát triển dự án' })
  businessSector: string;

  @Prop({ default: 'Tòa nhà DHI Tower, Số 18 Đường Hoàng Đạo Thúy, Cầu Giấy, Hà Nội' })
  address: string;

  @Prop({ default: 'contact@donghaiinvest.vn' })
  email: string;

  @Prop({ default: '024 3888 9999' })
  phone: string;

  @Prop({ default: '/donghai-logo.png' })
  logoUrl: string;

  @Prop({ default: true })
  isInitialized: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
