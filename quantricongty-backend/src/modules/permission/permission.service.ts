import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../schemas/permission.schema.js';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  async getMatrix(): Promise<any[]> {
    const doc = await this.permissionModel.findOne({ key: 'default_matrix' }).exec();
    return doc?.matrix || [];
  }

  async saveMatrix(matrix: any[]): Promise<any> {
    return this.permissionModel.findOneAndUpdate(
      { key: 'default_matrix' },
      { $set: { matrix } },
      { new: true, upsert: true },
    ).exec();
  }

  async getSystemAdmins(): Promise<any[]> {
    const doc = await this.permissionModel.findOne({ key: 'default_matrix' }).exec();
    return doc?.systemAdmins || [];
  }

  async saveSystemAdmins(systemAdmins: any[]): Promise<any> {
    return this.permissionModel.findOneAndUpdate(
      { key: 'default_matrix' },
      { $set: { systemAdmins } },
      { new: true, upsert: true },
    ).exec();
  }
}
