import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Approval, ApprovalDocument, ApprovalStatus, ApprovalType, LeaveType } from '../../schemas/approval.schema.js';
import { Employee, EmployeeDocument } from '../../schemas/employee.schema.js';
import { DailyAttendance, DailyAttendanceDocument, DailyStatus } from '../../schemas/daily-attendance.schema.js';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectModel(Approval.name) private approvalModel: Model<ApprovalDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(DailyAttendance.name) private dailyModel: Model<DailyAttendanceDocument>,
  ) {}

  private getFormattedNow(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  // Calculate working days between 2 dates (excluding Saturday and Sunday)
  private calculateWorkingDates(startDateStr: string, endDateStr: string): string[] {
    const dates: string[] = [];
    if (!startDateStr) return dates;
    const start = new Date(startDateStr);
    const end = endDateStr ? new Date(endDateStr) : new Date(startDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [startDateStr];

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates.length > 0 ? dates : [startDateStr];
  }

  async findAll(type?: string, status?: string, department?: string): Promise<Approval[]> {
    const count = await this.approvalModel.countDocuments().exec();
    if (count === 0) {
      await this.seedInitialApprovals();
    }

    const filter: any = {};
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (department && department !== 'ALL' && department !== 'all') {
      filter.department = department;
    }

    return this.approvalModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn phê duyệt!');
    return item;
  }

  async create(data: Partial<Approval>): Promise<Approval> {
    if (!data.title || !data.requesterCode) {
      throw new BadRequestException('Tiêu đề và người tạo đơn là bắt buộc!');
    }

    // 1. Fetch employee to check leave balance & role
    const emp = await this.employeeModel.findOne({
      $or: [{ code: data.requesterCode }, { email: data.requesterCode }],
    }).exec();

    let dates = data.dates || [];
    if ((!dates || dates.length === 0) && data.startDate) {
      dates = this.calculateWorkingDates(data.startDate, data.endDate || data.startDate);
    }
    const daysCount = data.daysCount || (dates.length > 0 ? dates.length : 1);

    // 2. If Leave type is annual, check if remaining leave is sufficient
    if (data.type === ApprovalType.LEAVE && (data.leaveType === LeaveType.ANNUAL || !data.leaveType)) {
      if (emp) {
        const remaining = emp.remainingLeave !== undefined ? emp.remainingLeave : (emp.annualLeaveQuota || 12) - (emp.usedLeave || 0);
        if (remaining < daysCount) {
          throw new BadRequestException(
            `Quỹ phép năm không đủ! Bạn còn ${remaining} ngày phép, nhưng đơn xin nghỉ ${daysCount} ngày.`,
          );
        }
      }
    }

    // 3. Determine initial status:
    // Q1: Trưởng phòng / Trưởng ban -> Chỉ cần duyệt 1 cấp (chuyển thẳng PENDING_HR)
    // Q2: Ban nào duyệt ban đó
    // Q3: Nếu ban KHÔNG CÓ TRƯỞNG PHÒNG -> Tự động chuyển thẳng lên Cấp 2 (PENDING_HR - HCNS duyệt) để không bị nghẽn đơn!
    let initialStatus = ApprovalStatus.PENDING_LEADER;
    const requesterRole = emp?.role || '';
    const requesterLevel = emp?.positionLevel || '';
    const requesterDept = emp?.department || data.department || '';
    const requesterPos = emp?.position || data.position || '';

    let skipReason = '';

    const isRequesterLeader =
      requesterDept.includes('Nhân sự') ||
      requesterRole === 'ADMIN' ||
      requesterRole === 'LEADER' ||
      requesterLevel === 'Trưởng Ban' ||
      requesterLevel === 'Ban Quản Trị' ||
      requesterPos.toLowerCase().includes('trưởng') ||
      requesterPos.toLowerCase().includes('giám đốc');

    if (isRequesterLeader) {
      // Trường hợp A: Người làm đơn là Trưởng ban / Lãnh đạo -> Chỉ cần 1 cấp duyệt chốt (HCNS / Ban Giám Đốc)
      initialStatus = ApprovalStatus.PENDING_HR;
      skipReason = 'Người tạo đơn là Lãnh đạo ban / Trưởng phòng, chỉ cần duyệt 1 cấp (chuyển thẳng lên Trưởng Ban HCNS)';
    } else {
      // Trường hợp B: Nhân viên thông thường -> Kiểm tra xem ban này hiện tại ĐÃ CÓ TRƯỞNG PHÒNG / TRƯỞNG BAN chưa
      const leaderInDept = await this.employeeModel.findOne({
        department: requesterDept,
        code: { $ne: emp?.code },
        $or: [
          { positionLevel: 'Trưởng Ban' },
          { positionLevel: 'Ban Quản Trị' },
          { role: 'LEADER' },
          { position: { $regex: /trưởng/i } },
        ],
      }).exec();

      if (!leaderInDept) {
        // Ban này KHÔNG CÓ TRƯỞNG BAN (vị trí đang kiện toàn/trống)!
        // Tự động chuyển thẳng lên Trưởng Ban HCNS duyệt trực tiếp để nhân viên không bị treo đơn.
        initialStatus = ApprovalStatus.PENDING_HR;
        skipReason = `Ban [${requesterDept}] hiện chưa có Trưởng Ban (vị trí đang kiện toàn) → Tự động chuyển thẳng lên Trưởng Ban HCNS phê duyệt trực tiếp`;
      }
    }

    const totalCount = await this.approvalModel.countDocuments().exec();
    const code = `DX-${new Date().getFullYear()}-${String(totalCount + 1).padStart(3, '0')}`;
    const timeNow = this.getFormattedNow();

    const created = await this.approvalModel.create({
      code,
      type: data.type || ApprovalType.LEAVE,
      title: data.title,
      requesterCode: emp?.code || data.requesterCode,
      requesterName: emp?.name || data.requesterName || 'Cán bộ',
      department: emp?.department || data.department || 'Chung',
      position: emp?.position || data.position || 'Chuyên viên',
      priority: data.priority || 'normal',
      reason: data.reason || '',
      status: initialStatus,
      leaveType: data.leaveType || LeaveType.ANNUAL,
      startDate: data.startDate || '',
      endDate: data.endDate || data.startDate || '',
      daysCount,
      dates,
      handoverTo: data.handoverTo || '',
      attachments: data.attachments || [],
      leaderApproval: {
        approvedBy: '',
        approvedByName: '',
        status: initialStatus === ApprovalStatus.PENDING_HR ? 'skipped' : 'pending',
        note: skipReason,
        time: '',
      },
      hrApproval: {
        approvedBy: '',
        approvedByName: '',
        status: 'pending',
        note: '',
        time: '',
      },
      history: [
        {
          step: 'Khởi tạo đơn',
          actor: emp?.name || data.requesterName || 'Nhân sự',
          action: `Đã gửi đề xuất ${data.type === 'leave' ? 'nghỉ phép' : 'phê duyệt'}`,
          time: timeNow,
          note: skipReason
            ? `${skipReason} - Số ngày đề xuất: ${daysCount} ngày`
            : `Số ngày đề xuất: ${daysCount} ngày (${dates.join(', ')})`,
        },
      ],
    });

    return created;
  }

  // Cấp 1: Trưởng ban duyệt (Ban nào duyệt ban đó)
  async leaderApprove(id: string, approverCode: string, approverName: string, isApproved: boolean, note?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    if (item.status !== ApprovalStatus.PENDING_LEADER) {
      throw new BadRequestException('Đơn không ở trạng thái Chờ Trưởng Ban duyệt!');
    }

    // KIỂM TRA QUY TẮC: "BAN NÀO DUYỆT BAN ĐÓ"
    const approver = await this.employeeModel.findOne({
      $or: [{ code: approverCode }, { email: approverCode }],
    }).exec();

    if (approver) {
      const isApproverAdmin =
        approver.role === 'ADMIN' ||
        approver.positionLevel === 'Ban Quản Trị' ||
        (approver.department && approver.department.includes('Nhân sự'));
      const isSameDept = approver.department === item.department;

      if (!isApproverAdmin && !isSameDept) {
        throw new BadRequestException(
          `Bạn thuộc [${approver.department}], không có thẩm quyền duyệt đơn của [${item.department}]. Ban nào chỉ duyệt ban đó!`
        );
      }
    }

    const timeNow = this.getFormattedNow();

    if (isApproved) {
      item.status = ApprovalStatus.PENDING_HR;
      item.leaderApproval = {
        approvedBy: approverCode,
        approvedByName: approverName,
        status: 'approved',
        note: note || 'Đồng ý duyệt cấp Ban',
        time: timeNow,
      };
      item.history.push({
        step: 'Trưởng Ban Duyệt (Cấp 1)',
        actor: approverName,
        action: 'Đã phê duyệt cấp Ban - Chuyển tiếp lên Trưởng ban HCNS',
        time: timeNow,
        note: note || 'Đạt yêu cầu bàn giao công việc',
      });
    } else {
      item.status = ApprovalStatus.REJECTED;
      item.leaderApproval = {
        approvedBy: approverCode,
        approvedByName: approverName,
        status: 'rejected',
        note: note || 'Không đồng ý',
        time: timeNow,
      };
      item.history.push({
        step: 'Trưởng Ban Từ Chối (Cấp 1)',
        actor: approverName,
        action: 'Từ chối phê duyệt đơn',
        time: timeNow,
        note: note || 'Chưa bố trí được nhân sự thay thế',
      });
    }

    return item.save();
  }

  // Cấp 2: Trưởng ban HCNS duyệt chốt (anh Khang)
  async hrApprove(id: string, approverCode: string, approverName: string, isApproved: boolean, note?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    if (item.status !== ApprovalStatus.PENDING_HR) {
      throw new BadRequestException('Đơn không ở trạng thái Chờ HCNS phê duyệt!');
    }

    const timeNow = this.getFormattedNow();

    if (isApproved) {
      item.status = ApprovalStatus.APPROVED;
      item.hrApproval = {
        approvedBy: approverCode,
        approvedByName: approverName,
        status: 'approved',
        note: note || 'Đã kiểm tra quỹ phép và phê duyệt',
        time: timeNow,
      };
      item.history.push({
        step: 'Trưởng Ban HCNS Phê Duyệt (Cấp 2)',
        actor: approverName,
        action: 'Phê duyệt chính thức & Ghi nhận công',
        time: timeNow,
        note: note || 'Hợp lệ theo quy chế công ty',
      });

      // 1. TRỪ PHÉP THẬT TRONG HỒ SƠ NHÂN VIÊN
      if (item.type === ApprovalType.LEAVE && item.leaveType === LeaveType.ANNUAL) {
        const emp = await this.employeeModel.findOne({ code: item.requesterCode }).exec();
        if (emp) {
          const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
          const carried = emp.carriedOverLeave || 0;
          const used = (emp.usedLeave || 0) + item.daysCount;
          const remaining = Math.max(0, (quota + carried) - used);

          emp.usedLeave = used;
          emp.remainingLeave = remaining;
          await emp.save();
        }
      }

      // 2. TỰ ĐỘNG ĐỒNG BỘ SANG BẢNG CHẤM CÔNG (KÝ HIỆU P, 1.0 CÔNG)
      if (item.type === ApprovalType.LEAVE && item.dates && item.dates.length > 0) {
        const isUnpaid = item.leaveType === LeaveType.UNPAID;
        const noteText =
          item.leaveType === LeaveType.ANNUAL
            ? 'Nghỉ phép năm (Đã duyệt)'
            : item.leaveType === LeaveType.PERSONAL
            ? 'Nghỉ việc riêng hưởng lương'
            : item.leaveType === LeaveType.SICK
            ? 'Nghỉ ốm BHXH'
            : 'Nghỉ việc riêng không lương';

        for (const dateStr of item.dates) {
          await this.dailyModel.updateOne(
            { userId: item.requesterCode, date: dateStr },
            {
              $set: {
                userId: item.requesterCode,
                name: item.requesterName,
                department: item.department,
                date: dateStr,
                firstIn: '',
                lastOut: '',
                punchCount: 0,
                status: isUnpaid ? DailyStatus.MISS : DailyStatus.NGHI_PHEP,
                workHours: isUnpaid ? 0 : 8.0,
                workTimeText: isUnpaid ? '0h' : '8h 00p',
                workCredit: isUnpaid ? 0.0 : 1.0,
                missingMinutes: 0,
                note: noteText,
              },
            },
            { upsert: true },
          );
        }
      }
    } else {
      item.status = ApprovalStatus.REJECTED;
      item.hrApproval = {
        approvedBy: approverCode,
        approvedByName: approverName,
        status: 'rejected',
        note: note || 'Từ chối duyệt đơn',
        time: timeNow,
      };
      item.history.push({
        step: 'Trưởng Ban HCNS Từ Chối (Cấp 2)',
        actor: approverName,
        action: 'Không chấp thuận đơn nghỉ phép',
        time: timeNow,
        note: note || 'Không đủ điều kiện phê duyệt',
      });
    }

    return item.save();
  }

  // Hủy đơn (người tạo đơn hủy)
  async cancelRequest(id: string, userCode: string, userName: string, reason?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    const timeNow = this.getFormattedNow();

    // Nếu đơn đang chờ duyệt -> Hủy ngay lập tức
    if (item.status === ApprovalStatus.PENDING_LEADER || item.status === ApprovalStatus.PENDING_HR) {
      item.status = ApprovalStatus.CANCELLED;
      item.cancelReason = reason || 'Người làm đơn chủ động hủy trước khi duyệt';
      item.history.push({
        step: 'Hủy đơn',
        actor: userName,
        action: 'Đã hủy đơn đề xuất',
        time: timeNow,
        note: reason || 'Kế hoạch cá nhân thay đổi',
      });
      return item.save();
    }

    // Nếu đơn ĐÃ DUYỆT -> Chuyển sang Đề xuất hủy đơn để HCNS xác nhận hoàn phép
    if (item.status === ApprovalStatus.APPROVED) {
      item.status = ApprovalStatus.REQUEST_CANCEL;
      item.cancelReason = reason || 'Nhân sự đề nghị hủy lịch nghỉ phép đã được duyệt';
      item.history.push({
        step: 'Đề xuất hủy đơn đã duyệt',
        actor: userName,
        action: 'Gửi đề xuất hủy đơn tới Ban HCNS để hoàn lại ngày phép',
        time: timeNow,
        note: reason || 'Đi làm bình thường theo yêu cầu đột xuất',
      });
      return item.save();
    }

    throw new BadRequestException(`Không thể hủy đơn đang ở trạng thái: ${item.status}`);
  }

  // HCNS xác nhận chấp thuận hủy đơn và hoàn trả ngày phép
  async hrApproveCancel(id: string, hrCode: string, hrName: string, isApproved: boolean, note?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    if (item.status !== ApprovalStatus.REQUEST_CANCEL) {
      throw new BadRequestException('Đơn không ở trạng thái Yêu Cầu Hủy!');
    }

    const timeNow = this.getFormattedNow();

    if (isApproved) {
      item.status = ApprovalStatus.CANCELLED;
      item.history.push({
        step: 'HCNS Duyệt Hủy Đơn',
        actor: hrName,
        action: 'Đã chấp thuận hủy đơn & Hoàn lại ngày phép vào quỹ',
        time: timeNow,
        note: note || 'Đã hoàn trả ngày phép thành công',
      });

      // 1. HOÀN LẠI NGÀY PHÉP VÀO QUỸ
      if (item.type === ApprovalType.LEAVE && item.leaveType === LeaveType.ANNUAL) {
        const emp = await this.employeeModel.findOne({ code: item.requesterCode }).exec();
        if (emp) {
          const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
          const carried = emp.carriedOverLeave || 0;
          const used = Math.max(0, (emp.usedLeave || 0) - item.daysCount);
          const remaining = Math.max(0, (quota + carried) - used);

          emp.usedLeave = used;
          emp.remainingLeave = remaining;
          await emp.save();
        }
      }

      // 2. KHÔI PHỤC BẢNG CHẤM CÔNG (GỠ BỎ KÝ HIỆU P ĐỂ VỀ BÌNH THƯỜNG)
      if (item.dates && item.dates.length > 0) {
        for (const dateStr of item.dates) {
          await this.dailyModel.deleteOne({
            userId: item.requesterCode,
            date: dateStr,
            status: DailyStatus.NGHI_PHEP,
          });
        }
      }
    } else {
      // Từ chối hủy -> Vẫn giữ nguyên là APPROVED
      item.status = ApprovalStatus.APPROVED;
      item.history.push({
        step: 'HCNS Từ Chối Hủy',
        actor: hrName,
        action: 'Không chấp thuận đề xuất hủy đơn',
        time: timeNow,
        note: note || 'Lịch nghỉ đã được chốt phân công',
      });
    }

    return item.save();
  }

  // Seed initial sample approvals for Uyên and Kiên
  private async seedInitialApprovals() {
    const timeNow = this.getFormattedNow();
    const seed = [
      {
        code: 'DX-2026-001',
        type: ApprovalType.LEAVE,
        title: 'Đơn xin nghỉ phép năm (1 ngày) giải quyết việc gia đình',
        requesterCode: 'ĐH0015',
        requesterName: 'Lê Phương Uyên',
        department: 'Ban Công nghệ Thông tin & Chuyển đổi số',
        position: 'Nhân viên IT',
        priority: 'normal',
        reason: 'Có việc giải quyết thủ tục giấy tờ tại địa phương.',
        status: ApprovalStatus.PENDING_LEADER,
        leaveType: LeaveType.ANNUAL,
        startDate: '2026-09-18',
        endDate: '2026-09-18',
        daysCount: 1,
        dates: ['2026-09-18'],
        handoverTo: 'Nguyễn Đức Kiên',
        attachments: [],
        leaderApproval: { approvedBy: '', approvedByName: '', status: 'pending', note: '', time: '' },
        hrApproval: { approvedBy: '', approvedByName: '', status: 'pending', note: '', time: '' },
        history: [
          {
            step: 'Khởi tạo đơn',
            actor: 'Lê Phương Uyên',
            action: 'Đã gửi đơn xin nghỉ phép 1 ngày',
            time: timeNow,
            note: 'Đã bàn giao công việc hỗ trợ hệ thống cho anh Kiên',
          },
        ],
      },
    ];

    await this.approvalModel.insertMany(seed);
  }
}
