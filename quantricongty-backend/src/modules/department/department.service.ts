import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from '../../schemas/department.schema.js';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private deptModel: Model<DepartmentDocument>,
  ) {}

  async getDepartments(): Promise<Department[]> {
    let depts = await this.deptModel.find().exec();
    if (depts.length === 0) {
      const defaultDepartments = [
        {
          name: 'Ban Đầu tư & Thẩm định Dự án',
          code: 'DHI-INV',
          description: 'Nghiên cứu thị trường, thẩm định và quản lý danh mục các dự án đầu tư',
          managerName: 'Trần Minh Quang',
          employeeCount: 4,
          color: 'bg-indigo-500',
        },
        {
          name: 'Ban Kinh doanh & Phát triển Dự án',
          code: 'DHI-BIZ',
          description: 'Phát triển khách hàng doanh nghiệp, đối tác chiến lược và mở rộng dự án',
          managerName: 'Lê Thị Thu Thảo',
          employeeCount: 3,
          color: 'bg-emerald-500',
        },
        {
          name: 'Ban Tài chính - Kế toán',
          code: 'DHI-FIN',
          description: 'Quản trị nguồn vốn, kế toán tài chính và lập báo cáo kiểm toán doanh nghiệp',
          managerName: 'Vũ Hoàng Long',
          employeeCount: 2,
          color: 'bg-violet-500',
        },
        {
          name: 'Ban Nhân sự & Hành chính Tổng hợp',
          code: 'DHI-HR',
          description: 'Tuyển dụng nhân tài, đào tạo cán bộ, chính sách đãi ngộ và quản trị văn phòng',
          managerName: 'Nguyễn Thị Mai Anh',
          employeeCount: 2,
          color: 'bg-rose-500',
        },
        {
          name: 'Ban Công nghệ Thông tin & Chuyển đổi số',
          code: 'DHI-IT',
          description: 'Phát triển hệ sinh thái phần mềm, an toàn thông tin và chuyển đổi số doanh nghiệp',
          managerName: 'Đặng Văn Hưng',
          employeeCount: 3,
          color: 'bg-blue-500',
        },
        {
          name: 'Ban Pháp chế & Kiểm soát Quản trị',
          code: 'DHI-LEG',
          description: 'Rà soát hợp đồng pháp lý, kiểm soát rủi ro và tuân thủ quy chế công ty',
          managerName: 'Phạm Quốc Huy',
          employeeCount: 1,
          color: 'bg-amber-500',
        },
      ];
      depts = await this.deptModel.insertMany(defaultDepartments);
    }
    return depts;
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return this.deptModel.create(data);
  }
}
