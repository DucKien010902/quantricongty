import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from '../../schemas/department.schema.js';
import { Employee, EmployeeDocument } from '../../schemas/employee.schema.js';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private deptModel: Model<DepartmentDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async getDepartments(): Promise<any[]> {
    let depts = await this.deptModel.find().exec();
    const defaultDepartments = [
      {
        name: 'Ban Đầu tư & Thẩm định Dự án',
        code: 'DHI-INV',
        description: 'Nghiên cứu thị trường, thẩm định và quản lý danh mục các dự án đầu tư',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-indigo-500',
      },
      {
        name: 'Ban Kinh doanh & Phát triển Dự án',
        code: 'DHI-BIZ',
        description: 'Phát triển khách hàng doanh nghiệp, đối tác chiến lược và mở rộng dự án',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-emerald-500',
      },
      {
        name: 'Ban Tài chính - Kế toán',
        code: 'DHI-FIN',
        description: 'Quản trị nguồn vốn, kế toán tài chính và lập báo cáo kiểm toán doanh nghiệp',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-violet-500',
      },
      {
        name: 'Ban Nhân sự & Hành chính Tổng hợp',
        code: 'DHI-HR',
        description: 'Tuyển dụng nhân tài, đào tạo cán bộ, chính sách đãi ngộ và quản trị văn phòng',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-rose-500',
      },
      {
        name: 'Ban Công nghệ Thông tin & Chuyển đổi số',
        code: 'DHI-IT',
        description: 'Phát triển hệ sinh thái phần mềm, an toàn thông tin và chuyển đổi số doanh nghiệp',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-blue-500',
      },
      {
        name: 'Ban Pháp chế & Kiểm soát Quản trị',
        code: 'DHI-LEG',
        description: 'Rà soát hợp đồng pháp lý, kiểm soát rủi ro và tuân thủ quy chế công ty',
        managerName: 'Chưa có',
        employeeCount: 0,
        color: 'bg-amber-500',
      },
    ];

    if (depts.length === 0) {
      depts = await this.deptModel.insertMany(defaultDepartments);
    }

    // Luôn tính toán thực tế từ danh sách nhân viên trong cơ sở dữ liệu
    const employees = await this.employeeModel.find().exec();

    const enrichedDepts = await Promise.all(
      depts.map(async (dept) => {
        const dName = (dept.name || '').toLowerCase().trim();
        const deptEmps = employees.filter((e) => {
          if (!e.department) return false;
          const eDept = e.department.toLowerCase().trim();
          return eDept === dName || dName.includes(eDept) || eDept.includes(dName);
        });

        const count = deptEmps.length;
        let managerName = 'Chưa có';

        if (count > 0) {
          // Ưu tiên nhân sự giữ chức vụ Trưởng phòng / Trưởng ban / Lãnh đạo / Giám đốc hoặc role LEADER / ADMIN
          const leader = deptEmps.find((e) => {
            const pos = (e.position || '').toLowerCase();
            const role = (e.role || '').toUpperCase();
            return (
              pos.includes('trưởng') ||
              pos.includes('lãnh đạo') ||
              pos.includes('giám đốc') ||
              role === 'LEADER' ||
              role === 'ADMIN'
            );
          });
          managerName = leader ? leader.name : 'Chưa có';
        }

        // Đồng bộ lại vào MongoDB Document nếu thông tin có sự thay đổi
        if (dept.managerName !== managerName || dept.employeeCount !== count) {
          await this.deptModel.updateOne(
            { _id: dept._id },
            { $set: { managerName, employeeCount: count } },
          );
        }

        const deptObj = dept.toObject ? dept.toObject() : { ...dept };
        return {
          ...deptObj,
          managerName,
          employeeCount: count,
        };
      }),
    );

    return enrichedDepts;
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return this.deptModel.create(data);
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<any> {
    // Tìm theo _id hoặc code
    let updated = await this.deptModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    if (!updated) {
      updated = await this.deptModel.findOneAndUpdate({ code: id }, { $set: data }, { new: true }).exec();
    }
    return updated;
  }

  async deleteDepartment(id: string): Promise<any> {
    let res = await this.deptModel.findByIdAndDelete(id).exec();
    if (!res) {
      res = await this.deptModel.findOneAndDelete({ code: id }).exec();
    }
    return res;
  }
}
