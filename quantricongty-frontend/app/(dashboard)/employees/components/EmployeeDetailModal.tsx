"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Edit3,
  Copy,
  Check,
  Building2,
  MapPin,
  Send,
  ShieldCheck,
  CreditCard,
  Phone,
  User,
  Briefcase,
  Heart,
  Star,
} from "lucide-react";
import { Employee } from "@/app/data/seed-employees";

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEditEmployee: (emp: Employee) => void;
  onSendInviteClick: (emp: Employee) => void;
}

const DETAIL_TABS = [
  { id: "overview", label: "Tóm tắt" },
  { id: "personal", label: "Cá nhân" },
  { id: "job", label: "Công việc" },
  { id: "benefits", label: "Đãi ngộ" },
  { id: "tax", label: "Pháp lý & Thuế" },
  { id: "contact", label: "Liên hệ" },
];

export default function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
  onEditEmployee,
  onSendInviteClick,
}: EmployeeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("personal");
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, fieldKey }: { text: string; fieldKey: string }) => (
    <button
      type="button"
      onClick={() => handleCopy(text, fieldKey)}
      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors flex-shrink-0"
      title="Sao chép"
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
      <span className="text-sm text-slate-500 sm:w-1/3 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 sm:w-2/3">
        {isLink && value ? (
          <a href={`tel:${value}`} className="text-sm font-bold text-blue-600 hover:underline">
            {value}
          </a>
        ) : (
          <span className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
            {value || <span className="text-slate-300 italic text-xs">Chưa có thông tin</span>}
          </span>
        )}
        {copyKey && value && <CopyBtn text={value} fieldKey={copyKey} />}
      </div>
    </div>
  );

  const getRoleDisplayName = (role?: string, pos?: string) => {
    if (pos && pos.trim() !== "" && !pos.startsWith("HEAD_")) return pos;
    if (role === "ADMIN") return "Quản trị viên";
    if (role === "HCNS") return "Trưởng Phòng Hành chính Nhân sự";
    if (role === "LEADER") return "Trưởng ban";
    if (role === "USER") return "Nhân viên";
    if (role === "CHAIRMAN") return "Chủ tịch HĐQT & CEO";
    if (role === "CEO") return "Tổng Giám Đốc";
    if (role === "HEAD_OF_DEPARTMENT") return "Trưởng Ban Chuyên Môn";
    if (role === "DEPUTY_HEAD") return "Phó Ban Chuyên Môn";
    if (role === "SPECIALIST") return "Chuyên viên chính thức";
    if (role === "PROBATION") return "Nhân viên thử việc";
    return role || "Cán bộ nhân viên";
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Chính thức", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
      case "probation":
        return { label: "Thử việc", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
      case "invited":
        return { label: "Đã gửi thư mời", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
      default:
        return { label: "Không xác định", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
    }
  };

  if (!isOpen && !visible) return null;
  const emp = employee;
  if (!emp) return null;

  const displayCode = (emp as any).code || emp.id || "—";
  const displayPosition = getRoleDisplayName((emp as any).role, (emp as any).position);
  const statusInfo = getStatusInfo(emp.status);

  if (!isOpen || !employee || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl bg-slate-50 z-[101] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ─── HEADER ─── */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200/80">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#1b365d] via-[#24487a] to-[#2c5b96] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile info */}
          <div className="px-6 sm:px-8 pb-5 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14">
              {/* Avatar */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-slate-100 flex-shrink-0">
                <Image
                  src={
                    emp.avatar ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={emp.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 pb-1">
                <button
                  onClick={() => onSendInviteClick(emp)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#1b365d]" />
                  Gửi thư mời
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => onEditEmployee(emp), 200);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Name & status */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{emp.name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                {displayCode}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Building2 className="w-4 h-4 text-slate-400" />
                {emp.department || "—"}
              </span>
              <span>•</span>
              <span className="text-[#1b365d] font-bold">{displayPosition}</span>
              {emp.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {emp.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-8 border-t border-slate-100 flex items-center gap-0.5 overflow-x-auto select-none no-scrollbar">
            {DETAIL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 px-3.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
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

        {/* ─── SCROLLABLE CONTENT ─── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-6">

            {/* TỔNG QUAN */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Hiệu suất KPI", value: (emp as any).performance ? `${(emp as any).performance}%` : "—", color: "text-blue-600", sub: "Đánh giá gần nhất" },
                    { label: "Bậc lương", value: (emp as any).salaryGrade || "—", color: "text-indigo-600", sub: "Khung lương hiện tại" },
                    { label: "Ngày gia nhập", value: emp.joinDate || "—", color: "text-slate-800", sub: "Ngày vào làm" },
                    { label: "Giới tính", value: emp.gender || "—", color: "text-emerald-600", sub: "Thông tin cá nhân" },
                  ].map(({ label, value, color, sub }) => (
                    <div key={label} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                      <p className="text-xs font-semibold text-slate-400">{label}</p>
                      <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#1b365d]" /> Tóm tắt nhân sự
                    </h3>
                    <div className="space-y-2.5 text-sm divide-y divide-slate-100">
                      {[
                        { label: "Mã nhân sự", value: displayCode, mono: true },
                        { label: "CCCD", value: (emp as any).idNumber, mono: true },
                        { label: "Mã số thuế", value: (emp as any).taxCode, mono: true },
                        { label: "Số BHXH", value: (emp as any).socialInsuranceNo, mono: true },
                      ].map(({ label, value, mono }) => (
                        <div key={label} className="flex justify-between py-2">
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
                      <CreditCard className="w-5 h-5 text-emerald-600" /> Liên hệ & Ngân hàng
                    </h3>
                    <div className="space-y-2.5 text-sm divide-y divide-slate-100">
                      {[
                        { label: "Số TK ngân hàng", value: (emp as any).bankAccount, mono: true },
                        { label: "Ngân hàng", value: (emp as any).bankName },
                        { label: "Điện thoại", value: emp.phone },
                        { label: "Email", value: emp.email },
                      ].map(({ label, value, mono }) => (
                        <div key={label} className="flex justify-between py-2">
                          <span className="text-slate-500">{label}:</span>
                          <span className={`font-semibold text-slate-800 truncate ml-2 max-w-[55%] ${mono ? "font-mono" : ""}`}>
                            {value || <span className="text-slate-300 italic text-xs">Chưa có</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CÁ NHÂN */}
            {activeTab === "personal" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
                  <button onClick={() => { onClose(); setTimeout(() => onEditEmployee(emp), 200); }}
                    className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Mã nhân viên" value={displayCode} copyKey="code" mono />
                  <InfoRow
                    label="Mã chấm công (Máy chấm công)"
                    value={(emp as any).attendanceCode || "--"}
                    copyKey="attendanceCode"
                    mono
                  />
                  <InfoRow label="Họ và tên" value={emp.name} />
                  <InfoRow label="Ngày sinh" value={(emp as any).dob} />
                  <InfoRow label="Giới tính" value={emp.gender} />
                  <InfoRow label="Email công việc" value={emp.email} copyKey="email" />
                  <InfoRow label="Số điện thoại" value={emp.phone} copyKey="phone" />
                  <InfoRow
                    label="Tình trạng hôn nhân"
                    value={
                      (emp as any).maritalStatus === "Độc thân" || !(emp as any).maritalStatus
                        ? "SINGLE (Độc thân)"
                        : (emp as any).maritalStatus
                    }
                  />
                  <InfoRow label="Quốc tịch" value={(emp as any).nationality || "Việt Nam"} />
                  <InfoRow label="Dân tộc" value={(emp as any).ethnic || "Kinh"} />
                  <InfoRow label="Tôn giáo" value={(emp as any).religion || "Không"} />
                  <InfoRow label="Nguyên quán" value={(emp as any).hometown} />
                </div>
              </div>
            )}

            {/* CÔNG VIỆC */}
            {activeTab === "job" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Thông tin công việc & Hợp đồng</h3>
                  <button onClick={() => { onClose(); setTimeout(() => onEditEmployee(emp), 200); }}
                    className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Ban / Khối chuyên môn" value={emp.department} />
                  <InfoRow label="Chức danh / Vị trí" value={displayPosition} />
                  <InfoRow label="Cấp bậc quản lý" value={(emp as any).workLevel} />
                  <InfoRow label="Loại hợp đồng lao động" value={(emp as any).contractType} />
                  <InfoRow label="Ngày bắt đầu vào làm" value={emp.joinDate} />
                  <InfoRow label="Người quản lý trực tiếp" value={(emp as any).directManager} />
                  <InfoRow label="Địa điểm công tác" value={emp.location} />
                  <InfoRow label="Trình độ học vấn" value={(emp as any).education} />
                </div>
              </div>
            )}

            {/* ĐÃI NGỘ */}
            {activeTab === "benefits" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Chế độ đãi ngộ & Tài khoản ngân hàng</h3>
                  <button onClick={() => { onClose(); setTimeout(() => onEditEmployee(emp), 200); }}
                    className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Bậc lương hiện tại" value={(emp as any).salaryGrade} />
                  <InfoRow label="Lương cơ bản" value={(emp as any).baseSalary} />
                  <InfoRow label="Số tài khoản nhận lương" value={(emp as any).bankAccount} copyKey="bankAccount" mono />
                  <InfoRow label="Ngân hàng thụ hưởng" value={(emp as any).bankName} />
                  <InfoRow label="Chi nhánh ngân hàng" value={(emp as any).bankBranch} />
                </div>
              </div>
            )}

            {/* PHÁP LÝ & THUẾ */}
            {activeTab === "tax" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Định danh pháp lý, Thuế & Bảo hiểm</h3>
                  <button onClick={() => { onClose(); setTimeout(() => onEditEmployee(emp), 200); }}
                    className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Số Căn cước công dân (CCCD)" value={(emp as any).idNumber} copyKey="idNumber" mono />
                  <InfoRow label="Ngày cấp CCCD" value={(emp as any).idIssueDate} />
                  <InfoRow label="Nơi cấp CCCD" value={(emp as any).idIssuePlace} />
                  <InfoRow label="Mã số thuế cá nhân (MST)" value={(emp as any).taxCode} copyKey="taxCode" mono />
                  <InfoRow label="Cơ quan thuế quản lý" value={(emp as any).taxAuthority} />
                  <InfoRow label="Mã số Bảo hiểm xã hội (BHXH)" value={(emp as any).socialInsuranceNo} copyKey="socialInsuranceNo" mono />
                  <InfoRow label="Mã số thẻ BHYT" value={(emp as any).healthInsuranceNo} copyKey="healthInsuranceNo" mono />
                  <InfoRow label="Nơi ĐK khám chữa bệnh ban đầu" value={(emp as any).hospital} />
                </div>
              </div>
            )}

            {/* LIÊN HỆ */}
            {activeTab === "contact" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ & Địa chỉ cư trú</h3>
                  <button onClick={() => { onClose(); setTimeout(() => onEditEmployee(emp), 200); }}
                    className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="Số điện thoại di động" value={emp.phone} isLink copyKey="phoneContact" />
                  <InfoRow label="Email công việc" value={emp.email} copyKey="emailContact" />
                  <InfoRow label="Email cá nhân" value={(emp as any).personalEmail} />
                  <InfoRow label="Địa chỉ thường trú" value={(emp as any).permanentAddress} />
                  <InfoRow label="Địa chỉ hiện tại / tạm trú" value={(emp as any).currentAddress} />
                  <InfoRow label="Người liên hệ khẩn cấp" value={(emp as any).emergencyContactName} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
