import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument, EmployeeRole, EmployeeStatus } from '../../schemas/employee.schema.js';
import * as xlsx from 'xlsx';
import { randomBytes } from 'crypto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async findAll(search?: string, department?: string, status?: string): Promise<Employee[]> {
    let count = await this.employeeModel.countDocuments().exec();
    if (count === 0) {
      await this.seedInitialEmployees();
    }

    const filter: any = {};
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { code: regex },
        { position: regex },
        { department: regex },
      ];
    }

    if (department && department !== 'all') {
      filter.department = new RegExp(department, 'i');
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    return this.employeeModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Employee | null> {
    return this.employeeModel.findById(id).exec();
  }

  async create(data: Partial<Employee>): Promise<Employee> {
    if (!data.name || !data.email) {
      throw new BadRequestException('Họ và tên và Email là bắt buộc!');
    }

    const existing = await this.employeeModel.findOne({ email: data.email }).exec();
    if (existing) {
      throw new BadRequestException(`Email ${data.email} đã tồn tại trong hệ thống!`);
    }

    const total = await this.employeeModel.countDocuments().exec();
    const nextCode = `DHI-${String(total + 1).padStart(3, '0')}`;
    const inviteToken = randomBytes(16).toString('hex');

    const created = await this.employeeModel.create({
      ...data,
      code: data.code || nextCode,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      gender: data.gender || 'Nam',
      avatar:
        data.avatar ||
        (data.gender === 'Nữ'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      department: data.department || 'Ban Đầu tư & Thẩm định Dự án',
      position: data.position || 'Chuyên viên Đầu tư',
      role: data.role || EmployeeRole.SPECIALIST,
      status: data.status || EmployeeStatus.INVITED,
      salaryGrade: data.salaryGrade || 'Bậc 3',
      attendanceCode: data.attendanceCode || '',
      location: data.location || 'Hà Nội',
      joinDate: data.joinDate || new Intl.DateTimeFormat('vi-VN').format(new Date()),
      inviteToken,
      performance: data.performance || 90,
      projectsCount: data.projectsCount || 1,
      annualLeaveQuota: data.annualLeaveQuota !== undefined ? Number(data.annualLeaveQuota) : 12,
      carriedOverLeave: data.carriedOverLeave !== undefined ? Number(data.carriedOverLeave) : 0,
      usedLeave: data.usedLeave !== undefined ? Number(data.usedLeave) : 0,
      remainingLeave:
        data.remainingLeave !== undefined
          ? Number(data.remainingLeave)
          : Math.max(
              0,
              (data.annualLeaveQuota !== undefined ? Number(data.annualLeaveQuota) : 12) +
                (data.carriedOverLeave !== undefined ? Number(data.carriedOverLeave) : 0) -
                (data.usedLeave !== undefined ? Number(data.usedLeave) : 0),
            ),
    });

    return created;
  }

  async update(id: string, data: Partial<Employee> & { operatorRole?: string }): Promise<Employee | null> {
    const updateData: any = { ...data };

    // Bảo mật phân quyền: Chỉ Quản trị viên (Admin) mới có quyền thay đổi vai trò hệ thống (role)
    if (updateData.operatorRole !== undefined && updateData.operatorRole.toUpperCase() !== 'ADMIN') {
      delete updateData.role;
    }
    delete updateData.operatorRole;

    if (
      updateData.annualLeaveQuota !== undefined ||
      updateData.carriedOverLeave !== undefined ||
      updateData.usedLeave !== undefined
    ) {
      const quota = updateData.annualLeaveQuota !== undefined ? Number(updateData.annualLeaveQuota) : 12;
      const carried = updateData.carriedOverLeave !== undefined ? Number(updateData.carriedOverLeave) : 0;
      const used = updateData.usedLeave !== undefined ? Number(updateData.usedLeave) : 0;
      updateData.remainingLeave = Math.max(0, (quota + carried) - used);
    }

    let emp = null;
    try {
      emp = await this.employeeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch {
      // id might not be ObjectId
    }
    if (!emp) {
      emp = await this.employeeModel.findOneAndUpdate(
        { $or: [{ code: id }, { email: data.email }] },
        updateData,
        { new: true }
      ).exec();
    }
    return emp;
  }

  async delete(id: string): Promise<any> {
    return this.employeeModel.findByIdAndDelete(id).exec();
  }

  async sendInvite(id: string): Promise<{ success: boolean; message: string; inviteLink: string; email: string; name: string }> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new BadRequestException('Không tìm thấy nhân viên!');
    }
    if (!employee.inviteToken) {
      employee.inviteToken = randomBytes(16).toString('hex');
      employee.status = EmployeeStatus.INVITED;
      await employee.save();
    }
    const inviteLink = `http://localhost:3000/invite?email=${encodeURIComponent(employee.email)}&token=${employee.inviteToken}`;
    console.log(`✉️ [EMAIL MỜI GIA NHẬP] Đã gửi thư mời tới: ${employee.email}`);
    console.log(`👉 Link đăng nhập kích hoạt: ${inviteLink}`);
    return {
      success: true,
      message: `Đã gửi thư mời gia nhập thành công tới email: ${employee.email}`,
      inviteLink,
      email: employee.email,
      name: employee.name,
    };
  }

  async exportTemplate(): Promise<Buffer> {
    const headers = [
      'Mã nhân viên (Tùy chọn)',
      'Họ và tên (*Bắt buộc)',
      'Email (*Bắt buộc - dùng gửi thư mời)',
      'Số điện thoại',
      'Giới tính (Nam/Nữ)',
      'Phòng ban (*Bắt buộc)',
      'Chức vụ (*Bắt buộc)',
      'Cấp bậc (CHAIRMAN/CEO/HEAD/SPECIALIST/PROBATION)',
      'Văn phòng (Hà Nội/TP.HCM/Đà Nẵng)',
    ];

    const sampleRows = [
      [
        'DHI-015',
        'Nguyễn Thành Đạt',
        'dat.nguyen@donghaiinvest.vn',
        '0912 345 678',
        'Nam',
        'Ban Đầu tư & Thẩm định Dự án',
        'Chuyên viên Thẩm định Dự án',
        'SPECIALIST',
        'Hà Nội',
      ],
      [
        'DHI-016',
        'Vũ Phương Thảo',
        'thao.vu@donghaiinvest.vn',
        '0988 777 666',
        'Nữ',
        'Ban Tài chính - Kế toán',
        'Kế toán viên',
        'SPECIALIST',
        'Hà Nội',
      ],
    ];

    const ws = xlsx.utils.aoa_to_sheet([headers, ...sampleRows]);
    // Set column widths
    ws['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 35 },
      { wch: 16 },
      { wch: 12 },
      { wch: 32 },
      { wch: 28 },
      { wch: 20 },
      { wch: 16 },
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Mau_Nhan_Su_DHI');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async importExcel(buffer: Buffer): Promise<{ total: number; imported: number; errors: string[] }> {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rawData: any[] = xlsx.utils.sheet_to_json(ws, { header: 1 });

    if (rawData.length < 2) {
      throw new BadRequestException('File Excel không có dữ liệu để import!');
    }

    const errors: string[] = [];
    let imported = 0;
    const count = await this.employeeModel.countDocuments().exec();

    // Loop through rows starting from index 1 (skipping header)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const code = row[0]?.toString().trim();
      const name = row[1]?.toString().trim();
      const email = row[2]?.toString().trim();
      const phone = row[3]?.toString().trim() || '';
      const gender = row[4]?.toString().trim() || 'Nam';
      const department = row[5]?.toString().trim() || 'Ban Đầu tư & Thẩm định Dự án';
      const position = row[6]?.toString().trim() || 'Chuyên viên';
      const roleStr = row[7]?.toString().trim() || 'SPECIALIST';
      const location = row[8]?.toString().trim() || 'Hà Nội';

      if (!name) {
        errors.push(`Dòng ${i + 1}: Thiếu Họ và tên.`);
        continue;
      }
      if (!email) {
        errors.push(`Dòng ${i + 1} (${name}): Thiếu Email mời.`);
        continue;
      }

      // Check if email already exists
      const existing = await this.employeeModel.findOne({ email }).exec();
      if (existing) {
        errors.push(`Dòng ${i + 1}: Email ${email} đã tồn tại trong hệ thống.`);
        continue;
      }

      const nextCode = code || `DHI-${String(count + imported + 1).padStart(3, '0')}`;
      const inviteToken = randomBytes(16).toString('hex');

      await this.employeeModel.create({
        code: nextCode,
        name,
        email,
        phone,
        gender,
        avatar:
          gender === 'Nữ'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department,
        position,
        role: roleStr,
        status: EmployeeStatus.INVITED,
        salaryGrade: 'Bậc 3',
        location,
        joinDate: new Intl.DateTimeFormat('vi-VN').format(new Date()),
        inviteToken,
        performance: 90,
        projectsCount: 1,
      });

      imported++;
    }

    return { total: rawData.length - 1, imported, errors };
  }

  private async seedInitialEmployees() {
    const seedData = [
      {
        code: 'DHI-001',
        attendanceCode: '1',
        name: 'Trần Văn Khang',
        gender: 'Nam',
        email: 'khang.tran@donghaiinvest.vn',
        phone: '0912 345 888',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department: 'Ban Nhân sự & Hành chính Tổng hợp',
        position: 'Trưởng Ban Hành chính - Nhân sự',
        positionLevel: 'Trưởng Ban',
        role: EmployeeRole.ADMIN,
        status: EmployeeStatus.ACTIVE,
        salaryGrade: 'Bậc 8',
        location: 'Hà Nội',
        joinDate: '01/01/2021',
        performance: 98,
        projectsCount: 10,
        contractType: 'Hợp đồng lao động không xác định thời hạn',
        workLevel: 'Trưởng Ban',
        bio: 'Trưởng Ban Hành chính - Nhân sự kiêm Quản trị viên hệ thống (Admin).',
      },
      {
        code: 'ĐH0050',
        attendanceCode: '3',
        name: 'Nguyễn Đức Kiên',
        gender: 'Nam',
        email: 'kien.nguyen@donghaiinvest.vn',
        phone: '0912 345 678',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
        department: 'Ban Công nghệ Thông tin & Chuyển đổi số',
        position: 'Nhân viên IT',
        positionLevel: 'Nhân Viên',
        role: EmployeeRole.ADMIN,
        status: EmployeeStatus.ACTIVE,
        salaryGrade: 'Bậc 5',
        location: 'Hà Nội',
        joinDate: '01/01/2021',
        performance: 99,
        projectsCount: 16,
        dob: '15/08/1995',
        maritalStatus: 'Độc thân',
        nationality: 'Việt Nam',
        ethnic: 'Kinh',
        religion: 'Không',
        placeOfBirth: 'Hà Nội',
        hometown: 'Hà Nội',
        idNumber: '001095012345',
        idIssueDate: '12/04/2021',
        idIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
        taxCode: '8492019281',
        taxAuthority: 'Chi cục Thuế TP. Hà Nội',
        socialInsuranceNo: '7916291029',
        healthInsuranceNo: 'DN4791629102901',
        hospital: 'Bệnh viện Hữu Nghị Việt Đức',
        bankAccount: '1903482910299',
        bankName: 'Techcombank',
        bankBranch: 'Hội sở Ba Đình - Hà Nội',
        baseSalary: 'Thỏa thuận',
        personalEmail: 'kien8438@gmail.com',
        workEmail: 'kien.nguyen@donghaiinvest.vn',
        permanentAddress: 'Số 68 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội',
        currentAddress: 'Biệt thự Hoa Lan, Vinhomes Riverside, Long Biên, Hà Nội',
        emergencyContactName: 'Nguyễn Văn Nam (Bố ruột) - 0903 219 888',
        contractType: 'Hợp đồng lao động không xác định thời hạn',
        contractDuration: 'Vô thời hạn',
        workLevel: 'Chuyên viên chính thức',
        education: 'Kỹ sư Công nghệ thông tin',
        bio: 'Nhân viên Công nghệ thông tin kiêm Quản trị viên hệ thống (Admin).',
      },
      {
        code: 'ĐH0015',
        attendanceCode: '6',
        name: 'Lê Phương Uyên',
        gender: 'Nữ',
        email: 'uyen.le@donghaiinvest.vn',
        phone: '0988 667 788',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        department: 'Ban Công nghệ Thông tin & Chuyển đổi số',
        position: 'Nhân viên IT',
        positionLevel: 'Nhân Viên',
        role: EmployeeRole.USER,
        status: EmployeeStatus.ACTIVE,
        salaryGrade: 'Bậc 3',
        location: 'Hà Nội',
        joinDate: '15/03/2022',
        performance: 95,
        projectsCount: 6,
        contractType: 'Hợp đồng lao động xác định thời hạn',
        workLevel: 'Chuyên viên chính thức',
        bio: 'Nhân viên Ban Công nghệ thông tin.',
      },
    ];

    await this.employeeModel.insertMany(seedData);
  }
}
