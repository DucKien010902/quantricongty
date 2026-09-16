import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../../schemas/employee.schema.js';
import { Company, CompanyDocument } from '../../schemas/company.schema.js';
import { MailService } from './mail.service.js';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectModel(Employee.name) private empModel: Model<EmployeeDocument>,
    @InjectModel(Company.name) private compModel: Model<CompanyDocument>,
  ) {}

  // 1. ĐĂNG NHẬP NHANH ADMIN TEST
  async quickAdminLogin() {
    const adminUser = {
      id: 'DHI-ADMIN-01',
      name: 'Nguyễn Đức Kiên',
      email: 'kiennd.forimex@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'CHAIRMAN',
      position: 'Chủ tịch HĐQT & CEO',
      company: 'Đông Hải',
    };

    const token = this.jwtService.sign(adminUser);
    return {
      accessToken: token,
      user: adminUser,
    };
  }

  async loginWithEmail(email: string, password?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const employee = await this.empModel.findOne({ email: cleanEmail }).exec();
    const isAdminEmail = cleanEmail.includes('kien') || cleanEmail === 'kiennd.forimex@gmail.com' || cleanEmail.includes('admin');

    if (!employee && !isAdminEmail) {
      throw new BadRequestException('Bạn không có trong tổ chức này. Vui lòng liên hệ Quản trị viên!');
    }

    const company = await this.compModel.findOne().exec();
    const companyName = company?.name || 'Công ty Cổ phần Đầu tư Đông Hải';

    const user = {
      id: employee?.code || (isAdminEmail ? 'DHI-001' : `NV-${Math.floor(100 + Math.random() * 900)}`),
      name: employee?.name || (isAdminEmail ? 'Nguyễn Đức Kiên' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      avatar: employee?.avatar || (isAdminEmail
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      role: employee?.role || 'ADMIN',
      position: employee?.position || (isAdminEmail ? 'Chủ tịch HĐQT & CEO' : 'Cán bộ nhân sự'),
      department: employee?.department || 'Ban Giám Đốc',
      company: companyName,
    };

    const token = this.jwtService.sign(user);
    return {
      accessToken: token,
      user,
    };
  }

  // 2. GỬI MÃ OTP VỀ EMAIL (CÓ KIỂM TRA WHITELIST NHÂN SỰ)
  async sendOtp(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Vui lòng nhập địa chỉ email hợp lệ!');
    }
    const cleanEmail = email.trim().toLowerCase();

    // Tra cứu xem email có trong danh sách nhân sự của công ty không
    const employee = await this.empModel.findOne({ email: cleanEmail }).exec();
    const isAdminEmail = cleanEmail.includes('kien') || cleanEmail === 'kiennd.forimex@gmail.com' || cleanEmail.includes('admin');

    if (!employee && !isAdminEmail) {
      throw new BadRequestException('Bạn không có trong tổ chức này. Vui lòng liên hệ Quản trị viên để được thêm vào danh sách nhân sự!');
    }

    // Lấy tên công ty
    const company = await this.compModel.findOne().exec();
    const companyName = company?.name || 'Công ty Cổ phần Đầu tư Đông Hải';

    // Sinh mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

    this.otpStore.set(cleanEmail, { code: otp, expiresAt });
    this.logger.log(`🔑 [OTP GENERATED] Email: ${cleanEmail} | OTP: ${otp}`);

    // Gửi email thật qua Nodemailer
    const emailSent = await this.mailService.sendOtpEmail(cleanEmail, otp, companyName);

    return {
      success: true,
      message: emailSent
        ? `Mã xác thực OTP đã được gửi đến hộp thư: ${cleanEmail}`
        : `Đã tạo mã OTP (kiểm tra hộp thư hoặc console server): ${otp}`,
      // Trong môi trường dev có thể đính kèm devOtp để test nhanh nếu muốn
      devOtp: otp,
    };
  }

  // 3. XÁC THỰC MÃ OTP & ĐĂNG NHẬP
  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Vui lòng nhập đầy đủ email và mã OTP!');
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const record = this.otpStore.get(cleanEmail);
    if (!record) {
      throw new BadRequestException('Chưa có mã OTP nào được gửi tới email này hoặc mã đã hết hạn!');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      throw new BadRequestException('Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu gửi lại!');
    }

    if (record.code !== cleanOtp) {
      throw new BadRequestException('Mã xác thực OTP không chính xác!');
    }

    // Xác thực thành công -> Xóa mã khỏi bộ nhớ
    this.otpStore.delete(cleanEmail);

    // Lấy thông tin công ty & nhân viên
    const company = await this.compModel.findOne().exec();
    const companyName = company?.name || 'Công ty Cổ phần Đầu tư Đông Hải';
    const employee = await this.empModel.findOne({ email: cleanEmail }).exec();
    const isAdminEmail = cleanEmail.includes('kien') || cleanEmail === 'kiennd.forimex@gmail.com' || cleanEmail.includes('admin');

    if (employee) {
      employee.status = 'active';
      await employee.save();
    }

    const user = {
      id: employee?.code || (isAdminEmail ? 'DHI-001' : `NV-${Math.floor(100 + Math.random() * 900)}`),
      name: employee?.name || (isAdminEmail ? 'Nguyễn Đức Kiên' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      avatar: employee?.avatar || (isAdminEmail
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      role: employee?.role || 'ADMIN',
      position: employee?.position || (isAdminEmail ? 'Chủ tịch HĐQT & CEO' : 'Cán bộ nhân sự'),
      department: employee?.department || 'Ban Giám Đốc',
      company: companyName,
    };

    const token = this.jwtService.sign(user);
    return {
      success: true,
      accessToken: token,
      user,
    };
  }

  // 4. ĐĂNG NHẬP BẰNG TÀI KHOẢN GOOGLE (CÓ KIỂM TRA WHITELIST)
  async googleWhitelistLogin(profile: { email: string; name?: string; picture?: string }) {
    if (!profile.email) {
      throw new BadRequestException('Không nhận được email từ tài khoản Google!');
    }
    const cleanEmail = profile.email.trim().toLowerCase();

    // Kiểm tra xem email Google này có trong tổ chức không
    const employee = await this.empModel.findOne({ email: cleanEmail }).exec();
    const isAdminEmail = cleanEmail === 'kiennd.forimex@gmail.com' || cleanEmail === 'admin@donghaiinvest.vn';

    if (!employee && !isAdminEmail) {
      throw new BadRequestException(`Bạn không có quyền truy cập! Email [${cleanEmail}] chưa được Quản trị viên thêm vào danh sách nhân sự của tổ chức!`);
    }

    const company = await this.compModel.findOne().exec();
    const companyName = company?.name || 'Công ty Cổ phần Đầu tư Đông Hải';

    if (employee) {
      employee.status = 'active';
      if (profile.picture && (!employee.avatar || employee.avatar.includes('unsplash'))) {
        employee.avatar = profile.picture;
      }
      await employee.save();
    }

    const user = {
      id: employee?.code || (isAdminEmail ? 'DHI-001' : `NV-${Math.floor(100 + Math.random() * 900)}`),
      name: employee?.name || profile.name || (isAdminEmail ? 'Nguyễn Đức Kiên' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      avatar: profile.picture || employee?.avatar || (isAdminEmail
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      role: employee?.role || 'ADMIN',
      position: employee?.position || (isAdminEmail ? 'Chủ tịch HĐQT & CEO' : 'Cán bộ nhân sự'),
      department: employee?.department || 'Ban Giám Đốc',
      company: companyName,
    };

    const token = this.jwtService.sign(user);
    return {
      success: true,
      accessToken: token,
      user,
    };
  }

  // 5. GIA NHẬP THEO LINK MỜI
  async joinByInvite(data: {
    inviteCode?: string;
    email?: string;
    name?: string;
    password?: string;
  }) {
    let emp = null;
    if (data.inviteCode) {
      emp = await this.empModel.findOne({ inviteToken: data.inviteCode }).exec();
    }
    if (!emp && data.email) {
      emp = await this.empModel.findOne({ email: data.email.trim().toLowerCase() }).exec();
    }

    const company = await this.compModel.findOne().exec();
    const companyName = company?.name || 'Công ty Cổ phần Đầu tư Đông Hải';

    if (emp) {
      emp.status = 'active';
      if (data.name && data.name.trim()) {
        emp.name = data.name.trim();
      }
      emp.role = 'ADMIN';
      await emp.save();

      const user = {
        id: emp.code,
        name: emp.name,
        email: emp.email,
        avatar: emp.avatar,
        role: 'ADMIN',
        position: emp.position,
        department: emp.department,
        company: companyName,
      };

      const token = this.jwtService.sign(user);
      return {
        success: true,
        accessToken: token,
        user,
      };
    }

    const cleanEmail = data.email ? data.email.trim().toLowerCase() : `member_${Date.now()}@donghaiinvest.vn`;
    const newEmp = await this.empModel.create({
      code: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'ADMIN',
      status: 'active',
      department: 'Ban Giám Đốc',
      position: 'Cán bộ nhân sự',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const user = {
      id: newEmp.code,
      name: newEmp.name,
      email: newEmp.email,
      avatar: newEmp.avatar,
      role: 'ADMIN',
      position: newEmp.position,
      department: newEmp.department,
      company: companyName,
    };

    const token = this.jwtService.sign(user);
    return {
      success: true,
      accessToken: token,
      user,
    };
  }
}
