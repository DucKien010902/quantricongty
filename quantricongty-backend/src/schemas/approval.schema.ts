import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApprovalDocument = Approval & Document;

export enum ApprovalStatus {
  PENDING_LEADER = 'PENDING_LEADER', // Chờ Trưởng ban duyệt
  PENDING_HR = 'PENDING_HR',         // Chờ Trưởng ban HCNS duyệt
  APPROVED = 'APPROVED',             // Đã phê duyệt hoàn tất
  REJECTED = 'REJECTED',             // Bị từ chối
  REQUEST_CANCEL = 'REQUEST_CANCEL', // Đề xuất hủy đơn đã duyệt
  CANCELLED = 'CANCELLED',           // Đã hủy đơn
}

export enum ApprovalType {
  LEAVE = 'leave',       // Đơn nghỉ phép
  TRIP = 'trip',         // Đề xuất công tác
  DOCUMENT = 'document', // Phê duyệt tài liệu
}

export enum LeaveType {
  ANNUAL = 'annual',     // Nghỉ phép năm (trừ quỹ phép, hưởng 1.0 lương)
  PERSONAL = 'personal', // Việc riêng có lương (kết hôn, tang chế...)
  SICK = 'sick',         // Nghỉ ốm đau / Thai sản (hưởng BHXH)
  UNPAID = 'unpaid',     // Nghỉ việc riêng không hưởng lương
}

@Schema({ timestamps: true })
export class Approval {
  @Prop({ required: true, unique: true })
  code: string; // VD: DX-2026-001

  @Prop({ required: true, default: ApprovalType.LEAVE })
  type: string; // leave | trip | document

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, index: true })
  requesterCode: string; // Mã nhân viên tạo đơn

  @Prop({ required: true })
  requesterName: string;

  @Prop({ required: true })
  department: string;

  @Prop({ default: 'Chuyên viên' })
  position: string;

  @Prop({ default: 'normal' })
  priority: string; // high | normal | low

  @Prop({ required: true })
  reason: string;

  @Prop({ default: ApprovalStatus.PENDING_LEADER, index: true })
  status: string;

  // Dành riêng cho Đơn Nghỉ Phép
  @Prop({ default: LeaveType.ANNUAL })
  leaveType: string;

  @Prop({ default: '' })
  startDate: string; // YYYY-MM-DD

  @Prop({ default: '' })
  endDate: string; // YYYY-MM-DD

  @Prop({ default: 1 })
  daysCount: number; // Số ngày nghỉ làm việc

  @Prop({ type: [String], default: [] })
  dates: string[]; // Danh sách các ngày cụ thể [YYYY-MM-DD]

  @Prop({ default: '' })
  handoverTo: string; // Người nhận bàn giao công việc

  @Prop({ default: '' })
  destination: string; // Địa điểm công tác

  @Prop({ default: '0 đ' })
  budget: string; // Tạm ứng / Chi phí dự toán

  @Prop({ default: 'Tự túc' })
  transportation: string; // Phương tiện di chuyển

  @Prop({ default: 'full' })
  leaveShift: string; // full | morning | afternoon

  @Prop({ default: '' })
  leaveShiftLabel: string;

  @Prop({ default: 'morning' })
  startSession: string;

  @Prop({ default: 'afternoon' })
  endSession: string;

  @Prop({ type: [String], default: [] })
  attachments: string[]; // Tệp đính kèm

  // Phê duyệt Cấp 1: Trưởng ban trực tiếp
  @Prop({
    type: {
      approvedBy: { type: String, default: '' },
      approvedByName: { type: String, default: '' },
      status: { type: String, default: 'pending' }, // pending | approved | rejected
      note: { type: String, default: '' },
      time: { type: String, default: '' },
    },
    default: () => ({ approvedBy: '', approvedByName: '', status: 'pending', note: '', time: '' }),
  })
  leaderApproval: {
    approvedBy: string;
    approvedByName: string;
    status: string;
    note: string;
    time: string;
  };

  // Phê duyệt Cấp 2: Trưởng ban Hành chính - Nhân sự (anh Khang)
  @Prop({
    type: {
      approvedBy: { type: String, default: '' },
      approvedByName: { type: String, default: '' },
      status: { type: String, default: 'pending' }, // pending | approved | rejected
      note: { type: String, default: '' },
      time: { type: String, default: '' },
    },
    default: () => ({ approvedBy: '', approvedByName: '', status: 'pending', note: '', time: '' }),
  })
  hrApproval: {
    approvedBy: string;
    approvedByName: string;
    status: string;
    note: string;
    time: string;
  };

  @Prop({ default: '' })
  cancelReason: string;

  // Nhật ký xử lý (Audit Log)
  @Prop({
    type: [
      {
        step: String,
        actor: String,
        action: String,
        time: String,
        note: String,
      },
    ],
    default: [],
  })
  history: {
    step: string;
    actor: string;
    action: string;
    time: string;
    note?: string;
  }[];
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
ApprovalSchema.index({ requesterCode: 1, createdAt: -1 });
ApprovalSchema.index({ status: 1 });
