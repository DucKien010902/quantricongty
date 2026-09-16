"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Edit3,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  CreditCard,
  Lock,
  MapPin,
  Download,
  Send,
} from "lucide-react";
import EditProfileWizardModal from "../../profile/components/EditProfileWizardModal";
import { Employee, DepartmentInfo } from "@/app/data/seed-employees";

import DocumentTypeIcon from "@/app/components/ui/DocumentTypeIcon";

interface EmployeeProfileViewProps {
  employee: Employee;
  departments: DepartmentInfo[];
  onBack: () => void;
  onUpdateEmployee: (id: string, updated: any) => void;
}

const PROFILE_TABS = [
  { id: "overview", label: "Tóm tắt" },
  { id: "personal", label: "Cá nhân" },
  { id: "job", label: "Công việc" },
  { id: "benefits", label: "Chế độ đãi ngộ" },
  { id: "tax", label: "Tuân thủ & Thuế" },
  { id: "contact", label: "Liên hệ" },
  { id: "documents", label: "Tài liệu" },
  { id: "permissions", label: "Vai trò & Chức năng" },
];

export default function EmployeeProfileView({
  employee,
  departments,
  onBack,
  onUpdateEmployee,
}: EmployeeProfileViewProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  // Local state so edits reflect immediately without full reload
  const [localEmp, setLocalEmp] = useState<any>(employee);

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = (updatedData: any) => {
    const merged = { ...localEmp, ...updatedData };
    setLocalEmp(merged);
    const id = (localEmp as any)._id || localEmp.id;
    onUpdateEmployee(id, merged);
  };

  const displayName = localEmp?.name || "—";
  const displayCode = localEmp?.code || localEmp?.id || "—";
  const displayPosition =
    localEmp?.position && !localEmp.position.startsWith("HEAD_")
      ? localEmp.position
      : localEmp?.role === "ADMIN"
      ? "Quản trị viên"
      : localEmp?.role === "LEADER"
      ? "Trưởng ban"
      : localEmp?.role === "HCNS"
      ? "Trưởng Phòng Hành chính Nhân sự"
      : localEmp?.role === "USER"
      ? "Nhân viên"
      : localEmp?.role || "Cán bộ nhân viên";
  const displayDepartment = localEmp?.department || "—";

  const getStatusBadge = () => {
    const s = localEmp?.status;
    if (s === "active")
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Chính thức
        </div>
      );
    if (s === "probation")
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Thử việc
        </div>
      );
    if (s === "invited")
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
          <Send className="w-3 h-3" />
          Đã gửi thư mời
        </div>
      );
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
        Không xác định
      </div>
    );
  };

  const CopyBtn = ({ text, fieldKey }: { text: string; fieldKey: string }) => (
    <button
      type="button"
      onClick={() => handleCopy(text, fieldKey)}
      title="Sao chép"
      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
    >
      {copiedField === fieldKey ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );

  const InfoRow = ({
    label,
    value,
    copyKey,
    mono,
    isLink,
  }: {
    label: string;
    value?: string | null;
    copyKey?: string;
    mono?: boolean;
    isLink?: boolean;
  }) => (
    <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
      <span className="text-sm text-slate-500 sm:w-1/3">{label}</span>
      <div className="flex items-center gap-2 sm:w-2/3">
        {isLink && value ? (
          <a href={`tel:${value}`} className="text-sm font-bold text-blue-600 hover:underline">{value}</a>
        ) : (
          <span className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
            {value || <span className="text-slate-300 italic text-xs">Chưa có thông tin</span>}
          </span>
        )}
        {copyKey && value && <CopyBtn text={value} fieldKey={copyKey} />}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1b365d] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Quay lại danh sách nhân sự
      </button>

      {/* PROFILE HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="h-36 sm:h-44 bg-gradient-to-r from-[#1b365d] via-[#24487a] to-[#2c5b96] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-slate-100 flex-shrink-0">
              <Image
                src={
                  localEmp?.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                }
                alt={displayName}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {displayName}
            </h1>
            {getStatusBadge()}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="Chỉnh sửa"
              className="p-1.5 text-slate-400 hover:text-[#1b365d] hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              {displayCode}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              {displayDepartment}
            </span>
            <span>•</span>
            <span className="text-[#1b365d] font-bold">{displayPosition}</span>
            {localEmp?.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {localEmp.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 sm:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto select-none no-scrollbar">
          {PROFILE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
                  isActive
                    ? "border-[#1b365d] text-[#1b365d] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB: TỔNG QUAN */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Hiệu suất KPI", value: localEmp?.performance ? `${localEmp.performance}%` : "—", color: "text-blue-600", sub: "Đánh giá gần nhất" },
              { label: "Bậc lương", value: localEmp?.salaryGrade || "—", color: "text-indigo-600", sub: "Khung lương hiện tại" },
              { label: "Ngày gia nhập", value: localEmp?.joinDate || "—", color: "text-slate-800", sub: "Ngày vào làm" },
              { label: "Giới tính", value: localEmp?.gender || "—", color: "text-emerald-600", sub: "Thông tin cá nhân" },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1b365d]" />
                Tóm tắt pháp lý & nhân sự
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Mã nhân sự", value: displayCode, mono: true },
                  { label: "Số CCCD", value: localEmp?.idNumber, mono: true },
                  { label: "Mã số thuế", value: localEmp?.taxCode, mono: true },
                  { label: "Số BHXH", value: localEmp?.socialInsuranceNo, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{label}:</span>
                    <span className={`font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
                      {value || <span className="text-slate-300 italic text-xs">Chưa có</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Tài khoản ngân hàng & Liên hệ
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Số tài khoản", value: localEmp?.bankAccount, mono: true },
                  { label: "Ngân hàng", value: localEmp?.bankName },
                  { label: "Điện thoại", value: localEmp?.phone },
                  { label: "Email", value: localEmp?.email },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{label}:</span>
                    <span className={`font-semibold text-slate-800 truncate ml-2 max-w-[60%] ${mono ? "font-mono" : ""}`}>
                      {value || <span className="text-slate-300 italic text-xs">Chưa có</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CÁ NHÂN */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Mã nhân viên" value={displayCode} copyKey="code" mono />
            <InfoRow
              label="Mã chấm công (Máy chấm công)"
              value={localEmp?.attendanceCode || "--"}
              copyKey="attendanceCode"
              mono
            />
            <InfoRow label="Họ và tên" value={localEmp?.name} />
            <InfoRow label="Ngày sinh" value={localEmp?.dob} />
            <InfoRow label="Giới tính" value={localEmp?.gender} />
            <InfoRow label="Email công việc" value={localEmp?.email} copyKey="email" />
            <InfoRow label="Số điện thoại" value={localEmp?.phone} copyKey="phone" />
            <InfoRow
              label="Tình trạng hôn nhân"
              value={
                localEmp?.maritalStatus === "Độc thân" || !localEmp?.maritalStatus
                  ? "SINGLE (Độc thân)"
                  : localEmp?.maritalStatus
              }
            />
            <InfoRow label="Quốc tịch" value={localEmp?.nationality || "Việt Nam"} />
            <InfoRow label="Dân tộc" value={localEmp?.ethnic || "Kinh"} />
            <InfoRow label="Tôn giáo" value={localEmp?.religion || "Không"} />
            <InfoRow label="Nguyên quán" value={localEmp?.hometown} />
          </div>
        </div>
      )}

      {/* TAB: CÔNG VIỆC */}
      {activeTab === "job" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin công việc & Hợp đồng</h3>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Ban / Khối chuyên môn" value={displayDepartment} />
            <InfoRow label="Chức danh / Vị trí" value={displayPosition} />
            <InfoRow label="Cấp bậc quản lý" value={localEmp?.workLevel} />
            <InfoRow label="Loại hợp đồng lao động" value={localEmp?.contractType} />
            <InfoRow label="Ngày bắt đầu vào làm" value={localEmp?.joinDate} />
            <InfoRow label="Người quản lý trực tiếp" value={localEmp?.directManager} />
            <InfoRow label="Địa điểm công tác" value={localEmp?.location} />
            <InfoRow label="Trình độ học vấn" value={localEmp?.education} />
          </div>
        </div>
      )}

      {/* TAB: CHẾ ĐỘ ĐÃI NGỘ */}
      {activeTab === "benefits" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Chế độ đãi ngộ & Tài khoản ngân hàng</h3>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Bậc lương hiện tại" value={localEmp?.salaryGrade} />
            <InfoRow label="Lương cơ bản" value={localEmp?.baseSalary} />
            <InfoRow label="Số tài khoản nhận lương" value={localEmp?.bankAccount} copyKey="bankAccount" mono />
            <InfoRow label="Ngân hàng thụ hưởng" value={localEmp?.bankName} />
            <InfoRow label="Chi nhánh ngân hàng" value={localEmp?.bankBranch} />
          </div>
        </div>
      )}

      {/* TAB: TUÂN THỦ & THUẾ */}
      {activeTab === "tax" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Định danh pháp lý, Thuế & Bảo hiểm xã hội</h3>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Số Căn cước công dân (CCCD)" value={localEmp?.idNumber} copyKey="idNumber" mono />
            <InfoRow label="Ngày cấp" value={localEmp?.idIssueDate} />
            <InfoRow label="Nơi cấp" value={localEmp?.idIssuePlace} />
            <InfoRow label="Mã số thuế cá nhân (MST)" value={localEmp?.taxCode} copyKey="taxCode" mono />
            <InfoRow label="Cơ quan thuế quản lý" value={localEmp?.taxAuthority} />
            <InfoRow label="Mã số Bảo hiểm xã hội (BHXH)" value={localEmp?.socialInsuranceNo} copyKey="socialInsuranceNo" mono />
            <InfoRow label="Mã số thẻ BHYT" value={localEmp?.healthInsuranceNo} copyKey="healthInsuranceNo" mono />
            <InfoRow label="Nơi ĐK khám chữa bệnh ban đầu" value={localEmp?.hospital} />
          </div>
        </div>
      )}

      {/* TAB: LIÊN HỆ */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ & Địa chỉ cư trú</h3>
            <button onClick={() => setIsEditModalOpen(true)} className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow label="Số điện thoại di động" value={localEmp?.phone} isLink copyKey="phone" />
            <InfoRow label="Email công việc" value={localEmp?.email} copyKey="emailContact" />
            <InfoRow label="Email cá nhân" value={localEmp?.personalEmail} />
            <InfoRow label="Địa chỉ thường trú" value={localEmp?.permanentAddress} />
            <InfoRow label="Địa chỉ hiện tại / tạm trú" value={localEmp?.currentAddress} />
            <InfoRow label="Người liên hệ khẩn cấp" value={localEmp?.emergencyContactName} />
          </div>
        </div>
      )}

      {/* TAB: TÀI LIỆU */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hồ sơ & Tài liệu đính kèm</h3>
              <p className="text-xs text-slate-500 mt-0.5">Các bản scan hợp đồng, giấy tờ định danh và bằng cấp chứng chỉ</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              { name: "Hợp đồng lao động", size: "—", date: localEmp?.joinDate || "—", type: "PDF" },
              { name: "Bản sao CCCD gắn chip (2 mặt)", size: "—", date: "—", type: "PDF" },
              { name: "Bằng cấp / Chứng chỉ chuyên môn", size: "—", date: "—", type: "PDF" },
            ].map((doc, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <DocumentTypeIcon type={doc.type} size="sm" showLabelBadge={false} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{doc.size} • {doc.date}</p>
                  </div>
                </div>
                <button type="button" title="Tải tài liệu" className="p-1.5 text-slate-400 hover:text-[#1b365d] rounded-lg transition-colors flex-shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: VAI TRÒ & CHỨC NĂNG */}
      {activeTab === "permissions" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Quyền hạn & Vai trò hệ thống</h3>
            <p className="text-xs text-slate-500 mt-0.5">Phân quyền quản trị nội bộ trong hệ thống</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Phân quyền hệ thống</span>
              <h4 className="text-base font-extrabold text-[#1b365d]">
                {localEmp?.role === "ADMIN" ? "Quản trị viên (ADMIN)" :
                 localEmp?.role === "LEADER" ? "Trưởng ban (LEADER)" :
                 localEmp?.role === "HCNS" ? "Hành chính Nhân sự (HCNS)" :
                 localEmp?.role === "USER" ? "Nhân viên thường (USER)" :
                 localEmp?.role || "Chưa phân quyền"}
              </h4>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Ban / Phòng:</span> {displayDepartment}</p>
            <p className="mt-1"><span className="font-semibold text-slate-800">Chức danh:</span> {displayPosition}</p>
            <p className="mt-1"><span className="font-semibold text-slate-800">Trạng thái tài khoản:</span> {localEmp?.status === "active" ? "Hoạt động" : localEmp?.status === "invited" ? "Đã gửi thư mời" : localEmp?.status || "—"}</p>
          </div>
        </div>
      )}

      {/* EDIT WIZARD MODAL */}
      <EditProfileWizardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={localEmp}
        departments={departments}
        onSave={handleSave}
      />
    </div>
  );
}
