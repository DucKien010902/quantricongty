import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

export enum EmployeeRole {
  ADMIN = 'ADMIN',
  HCNS = 'HCNS',
  LEADER = 'LEADER',
  USER = 'USER',
  CHAIRMAN = 'CHAIRMAN',
  CEO = 'CEO',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  DEPUTY_HEAD = 'DEPUTY_HEAD',
  SPECIALIST = 'SPECIALIST',
  PROBATION = 'PROBATION',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  PROBATION = 'probation',
  LEAVE = 'leave',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: '', index: true })
  attendanceCode: string; // Mã chấm công trên máy (VD: "3", "6", "11", "14", "17")

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 'Nam' })
  gender: string;

  @Prop({ default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' })
  avatar: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  position: string;

  @Prop({ default: 'Nhân Viên' })
  positionLevel: string; // Ban Quản Trị | Trưởng Ban | Nhân Viên

  @Prop({ default: EmployeeRole.USER })
  role: string;

  @Prop({ default: EmployeeStatus.INVITED })
  status: string;

  @Prop({ default: 'Bậc 3' })
  salaryGrade: string;

  @Prop({ default: 'Hà Nội' })
  location: string;

  @Prop({ default: () => new Intl.DateTimeFormat('vi-VN').format(new Date()) })
  joinDate: string;

  @Prop({ default: '' })
  inviteToken: string;

  @Prop({ default: 90 })
  performance: number;

  @Prop({ default: 1 })
  projectsCount: number;

  // Quỹ phép năm
  @Prop({ default: 12 })
  annualLeaveQuota: number; // Tổng ngày phép năm được cấp

  @Prop({ default: 0 })
  carriedOverLeave: number; // Phép tồn năm trước chuyển sang

  @Prop({ default: 0 })
  usedLeave: number; // Số ngày phép đã sử dụng

  @Prop({ default: 12 })
  remainingLeave: number; // Số ngày phép còn lại

  // Trường mở rộng chi tiết
  @Prop({ default: '' })
  dob: string;

  @Prop({ default: 'Độc thân' })
  maritalStatus: string;

  @Prop({ default: 'Việt Nam' })
  nationality: string;

  @Prop({ default: 'Kinh' })
  ethnic: string;

  @Prop({ default: 'Không' })
  religion: string;

  @Prop({ default: '' })
  placeOfBirth: string;

  @Prop({ default: '' })
  hometown: string;

  @Prop({ default: '' })
  idNumber: string;

  @Prop({ default: '' })
  idIssueDate: string;

  @Prop({ default: '' })
  idIssuePlace: string;

  @Prop({ default: '' })
  taxCode: string;

  @Prop({ default: '' })
  taxAuthority: string;

  @Prop({ default: '' })
  socialInsuranceNo: string;

  @Prop({ default: '' })
  healthInsuranceNo: string;

  @Prop({ default: '' })
  hospital: string;

  @Prop({ default: '' })
  bankAccount: string;

  @Prop({ default: '' })
  bankName: string;

  @Prop({ default: '' })
  bankBranch: string;

  @Prop({ default: '' })
  baseSalary: string;

  @Prop({ default: '' })
  personalEmail: string;

  @Prop({ default: '' })
  workEmail: string;

  @Prop({ default: '' })
  permanentAddress: string;

  @Prop({ default: '' })
  currentAddress: string;

  @Prop({ default: '' })
  emergencyContactName: string;

  @Prop({ default: '' })
  emergencyContactPhone: string;

  @Prop({ default: '' })
  emergencyRelationship: string;

  @Prop({ default: '' })
  contractType: string;

  @Prop({ default: '' })
  contractDuration: string;

  @Prop({ default: '' })
  directManager: string;

  @Prop({ default: '' })
  workLevel: string;

  @Prop({ default: '' })
  education: string;

  @Prop({ default: '' })
  bio: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
