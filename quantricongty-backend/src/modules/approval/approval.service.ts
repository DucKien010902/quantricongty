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

  // 1. Kiểm tra có phải là Trưởng phòng / Trưởng ban HCNS (Dựa vào CHỨC DANH)
  isHeadOfHR(emp: any): boolean {
    if (!emp) return false;
    const dept = (emp.department || '').toLowerCase();
    const pos = (emp.position || '').toLowerCase();
    const level = (emp.positionLevel || '').toLowerCase();

    const isHRDept =
      dept.includes('nhân sự') ||
      dept.includes('hcns') ||
      dept.includes('hành chính') ||
      dept.includes('tổ chức');

    const isLeaderTitle =
      pos.includes('trưởng') ||
      pos.includes('giám đốc') ||
      pos.includes('phụ trách') ||
      level.includes('trưởng') ||
      level.includes('quản trị');

    return isHRDept && isLeaderTitle;
  }

  // 2. Kiểm tra có phải nhân sự thuộc phòng HCNS
  isHREmployee(emp: any): boolean {
    if (!emp) return false;
    const dept = (emp.department || '').toLowerCase();
    return (
      dept.includes('nhân sự') ||
      dept.includes('hcns') ||
      dept.includes('hành chính') ||
      dept.includes('tổ chức')
    );
  }

  // 3. Kiểm tra có phải Trưởng ban / Trưởng phòng của một phòng ban chuyên môn
  isDepartmentLeader(emp: any): boolean {
    if (!emp) return false;
    const pos = (emp.position || '').toLowerCase();
    const level = (emp.positionLevel || '').toLowerCase();
    const role = (emp.role || '').toUpperCase();

    const isLeaderTitle =
      pos.includes('trưởng') ||
      pos.includes('giám đốc') ||
      pos.includes('phụ trách') ||
      level.includes('trưởng') ||
      level.includes('quản trị');

    return isLeaderTitle || role === 'LEADER';
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

    // 3. XÁC ĐỊNH LUỒNG PHÊ DUYỆT (THEO ĐÚNG QUY ĐỊNH DOANH NGHIỆP):
    // Quy tắc 1: Trưởng phòng HCNS -> Tự động duyệt luôn (APPROVED) & tự hủy được
    // Quy tắc 2: Trưởng ban các phòng ban khác -> Đi thẳng 1 bước tới Trưởng phòng HCNS duyệt (PENDING_HR)
    // Quy tắc 3: Nhân sự thuộc phòng HCNS -> Đi thẳng 1 bước tới Trưởng phòng HCNS duyệt (PENDING_HR)
    // Quy tắc 4: Phòng ban không có Trưởng phòng -> Đi thẳng 1 bước tới Trưởng phòng HCNS duyệt (PENDING_HR)
    // Quy tắc 5: Nhân sự thông thường các phòng ban khác -> Phải qua Trưởng phòng duyệt C1 (PENDING_LEADER), rồi mới tới Trưởng phòng HCNS (PENDING_HR)
    let initialStatus = ApprovalStatus.PENDING_LEADER;
    const requesterDept = emp?.department || data.department || '';

    let skipReason = '';

    if (this.isHeadOfHR(emp)) {
      // Quy tắc 1: Trưởng phòng HCNS xin nghỉ -> Được duyệt luôn trực tiếp
      initialStatus = ApprovalStatus.APPROVED;
      skipReason = 'Người làm đơn là Trưởng phòng/Trưởng ban HCNS → Tự động phê duyệt trực tiếp';
    } else if (this.isDepartmentLeader(emp)) {
      // Quy tắc 2: Trưởng ban các phòng ban khác -> Chỉ cần Trưởng phòng HCNS duyệt
      initialStatus = ApprovalStatus.PENDING_HR;
      skipReason = 'Người làm đơn là Trưởng Ban chuyên môn → Bỏ qua Cấp 1, chuyển thẳng tới Trưởng phòng HCNS duyệt';
    } else if (this.isHREmployee(emp)) {
      // Quy tắc 3: Nhân sự thuộc phòng HCNS -> Chuyển thẳng tới Trưởng phòng HCNS duyệt luôn
      initialStatus = ApprovalStatus.PENDING_HR;
      skipReason = 'Nhân sự thuộc phòng HCNS → Chuyển thẳng tới Trưởng phòng HCNS duyệt';
    } else {
      // Kiểm tra xem phòng ban của nhân sự này đã có Trưởng phòng / Trưởng ban chưa
      const leaderInDept = await this.employeeModel.findOne({
        department: requesterDept,
        code: { $ne: emp?.code },
        $or: [
          { positionLevel: 'Trưởng Ban' },
          { positionLevel: 'Ban Quản Trị' },
          { role: 'LEADER' },
          { position: { $regex: /trưởng|giám đốc|phụ trách/i } },
        ],
      }).exec();

      if (!leaderInDept) {
        // Quy tắc 4: Phòng ban không có Trưởng phòng -> Thẳng 1 bước tới Trưởng phòng HCNS
        initialStatus = ApprovalStatus.PENDING_HR;
        skipReason = `Ban [${requesterDept}] hiện chưa có Trưởng Ban → Chuyển thẳng tới Trưởng phòng HCNS duyệt`;
      } else {
        // Quy tắc 5: Nhân sự bình thường có Trưởng phòng -> Phê duyệt qua Trưởng phòng đó (Cấp 1) rồi tới Trưởng phòng HCNS
        initialStatus = ApprovalStatus.PENDING_LEADER;
      }
    }

    const totalCount = await this.approvalModel.countDocuments().exec();
    const code = `DX-${new Date().getFullYear()}-${String(totalCount + 1).padStart(3, '0')}`;
    const timeNow = this.getFormattedNow();

    const isAutoApproved = initialStatus === ApprovalStatus.APPROVED;
    const isC1Skipped = initialStatus === ApprovalStatus.PENDING_HR;

    const historyList = [
      {
        step: 'Khởi tạo đơn',
        actor: emp?.name || data.requesterName || 'Nhân sự',
        action: `Đã gửi đề xuất ${data.type === 'leave' ? 'nghỉ phép' : 'phê duyệt'}`,
        time: timeNow,
        note: `Số ngày đề xuất: ${daysCount} ngày (${dates.join(', ')})`,
      },
    ];

    if (isAutoApproved) {
      historyList.push({
        step: 'Tự động phê duyệt',
        actor: emp?.name || data.requesterName || 'Trưởng phòng HCNS',
        action: 'Tự động phê duyệt (Dành riêng cho Trưởng phòng HCNS)',
        time: timeNow,
        note: 'Đơn của Trưởng phòng HCNS được phê duyệt chấp thuận trực tiếp & đồng bộ chấm công',
      });
    } else if (isC1Skipped) {
      historyList.push({
        step: 'Chuyển thẳng HCNS (Bỏ qua C1)',
        actor: 'Hệ thống luồng duyệt',
        action: 'Chuyển thẳng tới Trưởng phòng HCNS phê duyệt',
        time: timeNow,
        note: skipReason,
      });
    }

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
        approvedBy: isAutoApproved ? emp?.code || data.requesterCode : '',
        approvedByName: isAutoApproved ? emp?.name || data.requesterName : '',
        status: isAutoApproved ? 'approved' : isC1Skipped ? 'skipped' : 'pending',
        note: isAutoApproved ? 'Đơn của Trưởng phòng HCNS (Tự động duyệt)' : isC1Skipped ? skipReason : '',
        time: isAutoApproved ? timeNow : '',
      },
      hrApproval: {
        approvedBy: isAutoApproved ? emp?.code || data.requesterCode : '',
        approvedByName: isAutoApproved ? emp?.name || data.requesterName : '',
        status: isAutoApproved ? 'approved' : 'pending',
        note: isAutoApproved ? 'Tự động duyệt và ghi nhận công cho Trưởng phòng HCNS' : '',
        time: isAutoApproved ? timeNow : '',
      },
      history: historyList,
    });

    // Nếu tự động duyệt (Trưởng phòng/Lãnh đạo), trừ phép và đồng bộ chấm công ngay
    if (isAutoApproved) {
      if (data.type === ApprovalType.LEAVE && (data.leaveType === LeaveType.ANNUAL || !data.leaveType)) {
        if (emp) {
          const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
          const carried = emp.carriedOverLeave || 0;
          const used = (emp.usedLeave || 0) + daysCount;
          const remaining = Math.max(0, quota + carried - used);

          emp.usedLeave = used;
          emp.remainingLeave = remaining;
          await emp.save();
        }
      }

      if (data.type === ApprovalType.LEAVE && dates && dates.length > 0) {
        const isUnpaid = data.leaveType === LeaveType.UNPAID;
        const noteText =
          data.leaveType === LeaveType.ANNUAL || !data.leaveType
            ? 'Nghỉ phép năm (Đã duyệt)'
            : data.leaveType === LeaveType.PERSONAL
            ? 'Nghỉ việc riêng hưởng lương'
            : data.leaveType === LeaveType.SICK
            ? 'Nghỉ ốm BHXH'
            : 'Nghỉ việc riêng không lương';

        for (const dateStr of dates) {
          await this.dailyModel.updateOne(
            { userId: emp?.code || data.requesterCode, date: dateStr },
            {
              $set: {
                status: DailyStatus.NGHI_PHEP,
                workCredit: isUnpaid ? 0.0 : 1.0,
                missingMinutes: 0,
                note: noteText,
                department: emp?.department || data.department,
                name: emp?.name || data.requesterName,
              },
            },
            { upsert: true },
          );
        }
      }
    }

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
      const isBoardOfDirectors =
        approver.positionLevel === 'Ban Quản Trị' ||
        approver.role === 'CHAIRMAN' ||
        approver.role === 'CEO';
      const isSameDept = approver.department === item.department;

      if (!isBoardOfDirectors && !isSameDept) {
        throw new BadRequestException(
          `Bạn thuộc [${approver.department}], không có thẩm quyền duyệt Cấp 1 của [${item.department}]. Đơn phải do Trưởng phòng / Trưởng ban của [${item.department}] duyệt trước!`
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

  // Cấp 2: Trưởng ban HCNS duyệt chốt (Dựa vào CHỨC DANH Trưởng phòng HCNS)
  async hrApprove(id: string, approverCode: string, approverName: string, isApproved: boolean, note?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    if (item.status !== ApprovalStatus.PENDING_HR) {
      throw new BadRequestException('Đơn không ở trạng thái Chờ HCNS phê duyệt!');
    }

    // KIỂM TRA THẨM QUYỀN DỰA VÀO CHỨC DANH TRƯỞNG PHÒNG HCNS (KHÔNG PHẢI CHỈ DỰA VÀO ROLE)
    const approver = await this.employeeModel.findOne({
      $or: [{ code: approverCode }, { email: approverCode }],
    }).exec();

    const isApproverHeadOfHR =
      this.isHeadOfHR(approver) ||
      approver?.role === 'ADMIN' ||
      approver?.positionLevel === 'Ban Quản Trị';

    if (!isApproverHeadOfHR) {
      throw new BadRequestException(
        'Chỉ có Trưởng phòng / Trưởng ban Hành chính - Nhân sự (hoặc Ban Quản Trị) mới có thẩm quyền phê duyệt Cấp 2!'
      );
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

    // Nếu đơn ĐÃ DUYỆT (APPROVED):
    if (item.status === ApprovalStatus.APPROVED) {
      const requester = await this.employeeModel.findOne({
        $or: [{ code: item.requesterCode }, { email: item.requesterCode }],
      }).exec();

      const isRequesterHeadOfHR = this.isHeadOfHR(requester);

      // ĐẶC BIỆT: "trưởng hcns thì xin nghỉ được luôn và tư hủy được"
      if (isRequesterHeadOfHR) {
        item.status = ApprovalStatus.CANCELLED;
        item.cancelReason = reason || 'Trưởng phòng HCNS chủ động tự hủy đơn đã duyệt';
        item.history.push({
          step: 'Trưởng phòng HCNS tự hủy đơn',
          actor: userName,
          action: 'Trưởng phòng HCNS tự hủy đơn & Hoàn lại ngày phép vào quỹ',
          time: timeNow,
          note: reason || 'Kế hoạch cá nhân thay đổi',
        });

        // 1. Hoàn lại ngày phép vào quỹ
        if (item.type === ApprovalType.LEAVE && (item.leaveType === LeaveType.ANNUAL || !item.leaveType)) {
          if (requester) {
            const quota = requester.annualLeaveQuota !== undefined ? requester.annualLeaveQuota : 12;
            const carried = requester.carriedOverLeave || 0;
            const used = Math.max(0, (requester.usedLeave || 0) - item.daysCount);
            const remaining = Math.max(0, (quota + carried) - used);

            requester.usedLeave = used;
            requester.remainingLeave = remaining;
            await requester.save();
          }
        }

        // 2. Khôi phục bảng chấm công
        if (item.dates && item.dates.length > 0) {
          for (const dateStr of item.dates) {
            await this.dailyModel.deleteOne({
              userId: item.requesterCode,
              date: dateStr,
              status: DailyStatus.NGHI_PHEP,
            });
          }
        }

        return item.save();
      }

      // Các nhân sự khác: Đơn đã duyệt chuyển sang REQUEST_CANCEL để Trưởng phòng HCNS duyệt hoàn phép
      item.status = ApprovalStatus.REQUEST_CANCEL;
      item.cancelReason = reason || 'Nhân sự đề nghị hủy lịch nghỉ phép đã được duyệt';
      item.history.push({
        step: 'Đề xuất hủy đơn đã duyệt',
        actor: userName,
        action: 'Gửi đề xuất hủy đơn tới Trưởng phòng HCNS để hoàn lại ngày phép',
        time: timeNow,
        note: reason || 'Đi làm bình thường theo yêu cầu đột xuất',
      });
      return item.save();
    }

    throw new BadRequestException(`Không thể hủy đơn đang ở trạng thái: ${item.status}`);
  }

  // HCNS xác nhận chấp thuận hủy đơn và hoàn trả ngày phép (Dựa vào CHỨC DANH Trưởng phòng HCNS)
  async hrApproveCancel(id: string, hrCode: string, hrName: string, isApproved: boolean, note?: string): Promise<Approval> {
    const item = await this.approvalModel.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy đơn!');

    if (item.status !== ApprovalStatus.REQUEST_CANCEL) {
      throw new BadRequestException('Đơn không ở trạng thái Yêu Cầu Hủy!');
    }

    // KIỂM TRA THẨM QUYỀN DỰA VÀO CHỨC DANH TRƯỞNG PHÒNG HCNS
    const approver = await this.employeeModel.findOne({
      $or: [{ code: hrCode }, { email: hrCode }],
    }).exec();

    const isApproverHeadOfHR =
      this.isHeadOfHR(approver) ||
      approver?.role === 'ADMIN' ||
      approver?.positionLevel === 'Ban Quản Trị';

    if (!isApproverHeadOfHR) {
      throw new BadRequestException(
        'Chỉ có Trưởng phòng / Trưởng ban Hành chính - Nhân sự (hoặc Ban Quản Trị) mới có thẩm quyền xác nhận hủy đơn hoàn phép!'
      );
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
