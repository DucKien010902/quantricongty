import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../../schemas/company.schema.js';
import { Department, DepartmentDocument } from '../../schemas/department.schema.js';
import { Employee, EmployeeDocument } from '../../schemas/employee.schema.js';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Department.name) private deptModel: Model<DepartmentDocument>,
    @InjectModel(Employee.name) private empModel: Model<EmployeeDocument>,
  ) {}

  async getCompany(): Promise<Company> {
    let company = await this.companyModel.findOne().exec();
    if (!company) {
      company = await this.companyModel.create({
        name: 'Công ty Cổ phần Đầu tư Đông Hải',
        brandName: 'DONG HAI INVEST',
        taxCode: '0109988776',
        businessSector: 'Đầu tư tài chính, Bất động sản và Phát triển dự án',
        address: 'Tòa nhà DHI Tower, Số 18 Đường Hoàng Đạo Thúy, Cầu Giấy, Hà Nội',
        email: 'contact@donghaiinvest.vn',
        phone: '024 3888 9999',
        logoUrl: '/donghai-logo.png',
        isInitialized: true,
      });
    }
    return company;
  }

  async updateCompany(data: Partial<Company>): Promise<Company> {
    let company = await this.companyModel.findOne().exec();
    if (!company) {
      company = await this.companyModel.create({ ...data, isInitialized: true });
    } else {
      Object.assign(company, data);
      await company.save();
    }
    return company;
  }

  async initWizard(payload: {
    company: any;
    departments?: any[];
    employees?: any[];
  }) {
    // 1. Cập nhật thông tin công ty
    let comp = await this.companyModel.findOne().exec();
    if (!comp) {
      comp = await this.companyModel.create({
        ...payload.company,
        isInitialized: true,
      });
    } else {
      Object.assign(comp, payload.company, { isInitialized: true });
      await comp.save();
    }

    // 2. Lưu / Đồng bộ danh sách Ban/Phòng
    if (payload.departments && payload.departments.length > 0) {
      for (const dept of payload.departments) {
        if (!dept.name) continue;
        await this.deptModel.findOneAndUpdate(
          { name: dept.name },
          {
            name: dept.name,
            code: dept.code || `DHI-${dept.name.substring(0, 3).toUpperCase()}`,
            description: dept.description || 'Ban chuyên môn điều hành',
            managerName: dept.managerName || dept.manager || 'Đang bổ nhiệm',
            color: dept.color || 'bg-blue-500',
          },
          { upsert: true, new: true },
        );
      }
    }

    // 3. Lưu / Đồng bộ danh sách Nhân sự ban đầu (kèm invite token)
    if (payload.employees && payload.employees.length > 0) {
      for (let i = 0; i < payload.employees.length; i++) {
        const emp = payload.employees[i];
        if (!emp.name || !emp.email) continue;
        const code = emp.code || `NV-${1000 + i + 1}`;
        const inviteToken =
          emp.inviteToken ||
          `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await this.empModel.findOneAndUpdate(
          { email: emp.email.trim().toLowerCase() },
          {
            code,
            name: emp.name,
            email: emp.email.trim().toLowerCase(),
            phone: emp.phone || '',
            department: emp.department || 'Ban Giám Đốc',
            position: emp.position || emp.role || 'Cán bộ nhân viên',
            role: 'ADMIN', // Ban đầu cấp quyền quản trị cho nhân sự như yêu cầu
            status: emp.status || 'invited',
            inviteToken,
            avatar:
              emp.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          { upsert: true, new: true },
        );
      }
    }

    return {
      success: true,
      message: 'Khởi tạo công ty thành công!',
      company: comp,
    };
  }
}
