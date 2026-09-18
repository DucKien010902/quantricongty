import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true, default: 'default_matrix' })
  key: string;

  @Prop({ type: Array, default: [] })
  matrix: any[];

  @Prop({ type: Array, default: [] })
  systemAdmins: any[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
