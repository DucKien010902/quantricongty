"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  ShieldAlert,
  PhoneCall,
  Save,
  Lock,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Employee, DepartmentInfo } from "@/app/data/seed-employees";

interface EditProfileWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  departments: DepartmentInfo[];
  onSave: (updatedUser: any) => void;
  isSelfProfile?: boolean;
}

const STEPS = [
  { id: 1, title: "Cá nhân", sub: "Lý lịch cơ bản", icon: User },
  { id: 2, title: "Công việc", sub: "Vị trí & Ban phòng", icon: Briefcase },
  { id: 3, title: "Định danh & Thuế", sub: "CCCD, MST, BHXH", icon: ShieldAlert },
  { id: 4, title: "Liên hệ & Ngân hàng", sub: "SĐT, Địa chỉ, STK", icon: PhoneCall },
];

export default function EditProfileWizardModal({
  isOpen,
  onClose,
  currentUser,
  departments,
  onSave,
  isSelfProfile = false,
}: EditProfileWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<any>({
    // Step 1: Cá nhân
    name: currentUser?.name || "",
    code: currentUser?.code || currentUser?.id || "",
    email: currentUser?.email || currentUser?.workEmail || "",
    workEmail: currentUser?.workEmail || currentUser?.email || "",
    phone: currentUser?.phone || "",
    attendanceCode: currentUser?.attendanceCode || "",
    gender: currentUser?.gender || "Nam",
    dob: currentUser?.dob || "",
    maritalStatus: currentUser?.maritalStatus || "Độc thân",
    nationality: currentUser?.nationality || "Việt Nam",
    ethnic: currentUser?.ethnic || "Kinh",
    religion: currentUser?.religion || "Không",
    placeOfBirth: currentUser?.placeOfBirth || "",
    hometown: currentUser?.hometown || "",

    // Step 2: Công việc
    department: currentUser?.department || departments[0]?.name || "Ban Giám Đốc",
    position: currentUser?.position || "Chuyên viên",
    positionLevel:
      currentUser?.positionLevel ||
      (currentUser?.role === "ADMIN" || currentUser?.role === "CHAIRMAN" || currentUser?.role === "CEO"
        ? "Ban Quản Trị"
        : currentUser?.role === "LEADER" || currentUser?.role === "HEAD_OF_DEPARTMENT"
        ? "Trưởng Ban"
        : "Nhân Viên"),
    role: currentUser?.role || "USER",
    status: currentUser?.status || "active",
    workLevel: currentUser?.workLevel || "Lãnh đạo cấp cao",
    contractType: currentUser?.contractType || "Hợp đồng không xác định thời hạn",
    contractDuration: currentUser?.contractDuration || "Vô thời hạn",
    joinDate: currentUser?.joinDate || "",
    directManager: currentUser?.directManager || "Hội đồng Quản trị",
    location: currentUser?.location || "Hà Nội",
    education: currentUser?.education || "",
    salaryGrade: currentUser?.salaryGrade || "Bậc 5",
    baseSalary: currentUser?.baseSalary || "",
    annualLeaveQuota: currentUser?.annualLeaveQuota !== undefined ? Number(currentUser.annualLeaveQuota) : 12,
    carriedOverLeave: currentUser?.carriedOverLeave !== undefined ? Number(currentUser.carriedOverLeave) : 0,
    performance: currentUser?.performance !== undefined ? Number(currentUser.performance) : 90,
    projectsCount: currentUser?.projectsCount !== undefined ? Number(currentUser.projectsCount) : 1,

    // Step 3: Định danh & Thuế
    idNumber: currentUser?.idNumber || "",
    idIssueDate: currentUser?.idIssueDate || "",
    idIssuePlace: currentUser?.idIssuePlace || "Cục Cảnh sát QLHC về TTXH",
    taxCode: currentUser?.taxCode || "",
    taxAuthority: currentUser?.taxAuthority || "Chi cục Thuế TP. Hà Nội",
    socialInsuranceNo: currentUser?.socialInsuranceNo || "",
    healthInsuranceNo: currentUser?.healthInsuranceNo || "",
    hospital: currentUser?.hospital || "Bệnh viện Hữu Nghị Việt Đức",

    // Step 4: Liên hệ & Ngân hàng
    personalEmail: currentUser?.personalEmail || "",
    permanentAddress: currentUser?.permanentAddress || "",
    currentAddress: currentUser?.currentAddress || "",
    bankAccount: currentUser?.bankAccount || "",
    bankName: currentUser?.bankName || "Techcombank",
    bankBranch: currentUser?.bankBranch || "Hội sở Hà Nội",
    emergencyContactName: currentUser?.emergencyContactName || "",
    emergencyContactPhone: currentUser?.emergencyContactPhone || "",
    emergencyRelationship: currentUser?.emergencyRelationship || "",
  });

  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser?.name || "",
        code: currentUser?.code || currentUser?.id || "",
        email: currentUser?.email || currentUser?.workEmail || "",
        workEmail: currentUser?.workEmail || currentUser?.email || "",
        phone: currentUser?.phone || "",
        attendanceCode: currentUser?.attendanceCode || "",
        gender: currentUser?.gender || "Nam",
        dob: currentUser?.dob || "",
        maritalStatus: currentUser?.maritalStatus || "Độc thân",
        nationality: currentUser?.nationality || "Việt Nam",
        ethnic: currentUser?.ethnic || "Kinh",
        religion: currentUser?.religion || "Không",
        placeOfBirth: currentUser?.placeOfBirth || "",
        hometown: currentUser?.hometown || "",
        department: currentUser?.department || departments[0]?.name || "Ban Giám Đốc",
        position: currentUser?.position || "Chuyên viên",
        positionLevel:
          currentUser?.positionLevel ||
          (currentUser?.role === "ADMIN" || currentUser?.role === "CHAIRMAN" || currentUser?.role === "CEO"
            ? "Ban Quản Trị"
            : currentUser?.role === "LEADER" || currentUser?.role === "HEAD_OF_DEPARTMENT"
            ? "Trưởng Ban"
            : "Nhân Viên"),
        role: currentUser?.role || "USER",
        status: currentUser?.status || "active",
        workLevel: currentUser?.workLevel || "Lãnh đạo cấp cao",
        contractType: currentUser?.contractType || "Hợp đồng không xác định thời hạn",
        contractDuration: currentUser?.contractDuration || "Vô thời hạn",
        joinDate: currentUser?.joinDate || "",
        directManager: currentUser?.directManager || "Hội đồng Quản trị",
        location: currentUser?.location || "Hà Nội",
        education: currentUser?.education || "",
        salaryGrade: currentUser?.salaryGrade || "Bậc 5",
        baseSalary: currentUser?.baseSalary || "",
        annualLeaveQuota: currentUser?.annualLeaveQuota !== undefined ? Number(currentUser.annualLeaveQuota) : 12,
        carriedOverLeave: currentUser?.carriedOverLeave !== undefined ? Number(currentUser.carriedOverLeave) : 0,
        performance: currentUser?.performance !== undefined ? Number(currentUser.performance) : 90,
        projectsCount: currentUser?.projectsCount !== undefined ? Number(currentUser.projectsCount) : 1,
        idNumber: currentUser?.idNumber || "",
        idIssueDate: currentUser?.idIssueDate || "",
        idIssuePlace: currentUser?.idIssuePlace || "Cục Cảnh sát QLHC về TTXH",
        taxCode: currentUser?.taxCode || "",
        taxAuthority: currentUser?.taxAuthority || "Chi cục Thuế TP. Hà Nội",
        socialInsuranceNo: currentUser?.socialInsuranceNo || "",
        healthInsuranceNo: currentUser?.healthInsuranceNo || "",
        hospital: currentUser?.hospital || "Bệnh viện Hữu Nghị Việt Đức",
        personalEmail: currentUser?.personalEmail || "",
        permanentAddress: currentUser?.permanentAddress || "",
        currentAddress: currentUser?.currentAddress || "",
        bankAccount: currentUser?.bankAccount || "",
        bankName: currentUser?.bankName || "Techcombank",
        bankBranch: currentUser?.bankBranch || "Hội sở Hà Nội",
        emergencyContactName: currentUser?.emergencyContactName || "",
        emergencyContactPhone: currentUser?.emergencyContactPhone || "",
        emergencyRelationship: currentUser?.emergencyRelationship || "",
      });
    }
  }, [currentUser, isOpen, departments]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      if (field === "email") {
        updated.workEmail = value;
      } else if (field === "workEmail") {
        updated.email = value;
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinalSave = () => {
    let safeData = { ...formData };
    if (isSelfProfile) {
      // BẢO VỆ TUYỆT ĐỐI CÁC TRƯỜNG QUẢN TRỊ KHI CÁN BỘ TỰ CHỈNH SỬA HỒ SƠ:
      // Giữ nguyên mã chấm công, mã NV, quyền hệ thống, chức danh, lương, phép từ currentUser
      safeData = {
        ...safeData,
        code: currentUser?.code || currentUser?.id || "",
        attendanceCode: currentUser?.attendanceCode || "",
        role: currentUser?.role || "USER",
        positionLevel: currentUser?.positionLevel || "Nhân Viên",
        department: currentUser?.department || departments[0]?.name || "Ban Giám Đốc",
        position: currentUser?.position || "Chuyên viên",
        workLevel: currentUser?.workLevel || "",
        status: currentUser?.status || "active",
        salaryGrade: currentUser?.salaryGrade || "",
        baseSalary: currentUser?.baseSalary || "",
        annualLeaveQuota: currentUser?.annualLeaveQuota !== undefined ? Number(currentUser.annualLeaveQuota) : 12,
        carriedOverLeave: currentUser?.carriedOverLeave !== undefined ? Number(currentUser.carriedOverLeave) : 0,
        performance: currentUser?.performance !== undefined ? Number(currentUser.performance) : 90,
        projectsCount: currentUser?.projectsCount !== undefined ? Number(currentUser.projectsCount) : 1,
        contractType: currentUser?.contractType || "",
        contractDuration: currentUser?.contractDuration || "",
        joinDate: currentUser?.joinDate || "",
        directManager: currentUser?.directManager || "",
        email: currentUser?.email || currentUser?.workEmail || "",
        workEmail: currentUser?.workEmail || currentUser?.email || "",
      };
    }
    onSave(safeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {isSelfProfile ? "Cập Nhật Hồ Sơ Cá Nhân" : "Cập Nhật Hồ Sơ Nhân Sự"}
              {isSelfProfile && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                  Tự khai báo
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSelfProfile
                ? "Chỉnh sửa thông tin liên hệ, lý lịch cá nhân và trình độ học vấn"
                : "Chỉnh sửa thông tin từng phần tiện lợi, thông tin lưu trữ an toàn"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 select-none">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-[#1b365d] text-white shadow-xs font-semibold"
                      : isPast
                      ? "bg-blue-50/80 text-[#1b365d] hover:bg-blue-100/60"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isPast
                        ? "bg-blue-100 text-[#1b365d]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                  </div>
                  <div className="hidden sm:flex flex-col min-w-0">
                    <span className="text-xs font-bold leading-tight truncate">
                      {step.title}
                    </span>
                    <span
                      className={`text-[10px] leading-tight truncate ${
                        isActive ? "text-white/80" : "text-slate-400"
                      }`}
                    >
                      {step.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ===================== BƯỚC 1: THÔNG TIN CÁ NHÂN ===================== */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1b365d]" />
                  Thông tin lý lịch cá nhân
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                {!isSelfProfile && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã nhân sự
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleChange("code", e.target.value)}
                      placeholder="ĐH0050"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Email công việc (Email chính) <span className="text-rose-500">*</span></span>
                    {isSelfProfile && (
                      <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Cố định tài khoản
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSelfProfile}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="kien.nguyen@donghaiinvest.vn"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border text-slate-800 transition-all font-medium ${
                      isSelfProfile
                        ? "bg-slate-100/80 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại di động
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                {!isSelfProfile && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Mã chấm công (Máy chấm công)</span>
                      <span className="text-[10px] text-blue-600 font-normal">Tự động khớp công</span>
                    </label>
                    <input
                      type="text"
                      value={formData.attendanceCode || ""}
                      onChange={(e) => handleChange("attendanceCode", e.target.value)}
                      placeholder="VD: 1, 3, 6, 11..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-blue-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="15/08/1995"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tình trạng hôn nhân
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange("maritalStatus", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Độc thân">Độc thân (SINGLE)</option>
                    <option value="Đã kết hôn">Đã kết hôn (MARRIED)</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quốc tịch
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    placeholder="Việt Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dân tộc
                  </label>
                  <input
                    type="text"
                    value={formData.ethnic}
                    onChange={(e) => handleChange("ethnic", e.target.value)}
                    placeholder="Kinh"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tôn giáo
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => handleChange("religion", e.target.value)}
                    placeholder="Không"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nơi sinh
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleChange("placeOfBirth", e.target.value)}
                    placeholder="Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quê quán / Nguyên quán
                  </label>
                  <input
                    type="text"
                    value={formData.hometown}
                    onChange={(e) => handleChange("hometown", e.target.value)}
                    placeholder="Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== BƯỚC 2: THÔNG TIN CÔNG VIỆC ===================== */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1b365d]" />
                  {isSelfProfile ? "Thông tin vị trí & học vấn" : "Thông tin vị trí & công tác"}
                </h4>
              </div>

              {isSelfProfile ? (
                /* CHẾ ĐỘ TỰ KHAI BÁO CỦA CÁN BỘ NHÂN VIÊN:
                   Ẩn hoàn toàn mã chấm công, mã NV, quyền hệ thống, chức danh, lương, phép...
                   Chỉ hiển thị tóm tắt vị trí do HCNS quản lý dưới dạng thẻ khóa, và cho phép sửa học vấn, địa điểm làm việc */
                <div className="space-y-4">
                  {/* Banner thông báo quyền quản lý HCNS */}
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-0.5 flex-shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Thông tin tổ chức & phân quyền do HCNS quản lý
                      </h5>
                      <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                        Chức danh, ban phòng trực thuộc, mã máy chấm công, ngạch bậc lương, quỹ ngày phép và quyền hạn hệ thống được phân bổ tập trung bởi Ban Lãnh đạo & Ban Hành chính - Nhân sự. Cán bộ nhân viên không có quyền tự thay đổi các mục này.
                      </p>
                    </div>
                  </div>

                  {/* Thông tin công tác hiện tại (Chỉ đọc) */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Cơ cấu công tác hiện tại
                      </h5>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Cố định theo hồ sơ HCNS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Ban / Khối chuyên môn:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {formData.department || "—"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Chức vụ / Chức danh:</span>
                        <span className="font-bold text-[#1b365d] flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#1b365d]" />
                          {formData.position || "—"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Cấp bậc công tác:</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {formData.workLevel || "—"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Loại hợp đồng:</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {formData.contractType || "—"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Quản lý trực tiếp:</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {formData.directManager || "—"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block font-medium">Ngày tiếp nhận công tác:</span>
                        <span className="font-semibold text-slate-700 mt-0.5 block">
                          {formData.joinDate || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mục tự khai báo trình độ học vấn & cơ sở công tác */}
                  <div className="border-t border-slate-100 pt-3">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Thông tin học vấn & công tác tự khai báo
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Trình độ học vấn / Bằng cấp chuyên môn
                        </label>
                        <input
                          type="text"
                          value={formData.education}
                          onChange={(e) => handleChange("education", e.target.value)}
                          placeholder="Cử nhân, Kỹ sư, Thạc sĩ..."
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa điểm làm việc / Cơ sở
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          placeholder="Trụ sở chính Hà Nội"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ QUẢN TRỊ VIÊN / HCNS QUẢN LÝ NHÂN SỰ TẠI /employees: Đầy đủ các trường nghiệp vụ */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ban / Phòng chuyên môn
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                    >
                      <option value="Ban Giám Đốc">Ban Giám Đốc</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ / Chức danh
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    placeholder="Chủ tịch HĐQT & CEO"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cấp bậc vị trí
                  </label>
                  <input
                    type="text"
                    value={formData.workLevel}
                    onChange={(e) => handleChange("workLevel", e.target.value)}
                    placeholder="Lãnh đạo cấp cao (C-Level)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại hợp đồng lao động
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => handleChange("contractType", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Hợp đồng lao động không xác định thời hạn">
                      Hợp đồng không xác định thời hạn
                    </option>
                    <option value="Hợp đồng lao động có thời hạn (1 - 3 năm)">
                      Hợp đồng xác định thời hạn (1 - 3 năm)
                    </option>
                    <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
                    <option value="Hợp đồng cộng tác viên">Cộng tác viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày vào làm (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={formData.joinDate}
                    onChange={(e) => handleChange("joinDate", e.target.value)}
                    placeholder="01/01/2021"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quản lý trực tiếp
                  </label>
                  <input
                    type="text"
                    value={formData.directManager}
                    onChange={(e) => handleChange("directManager", e.target.value)}
                    placeholder="Hội đồng Quản trị"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bậc lương / Khung lương
                  </label>
                  <input
                    type="text"
                    value={formData.salaryGrade}
                    onChange={(e) => handleChange("salaryGrade", e.target.value)}
                    placeholder="Bậc 10"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa điểm làm việc
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Trụ sở Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trình độ học vấn
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    placeholder="Thạc sĩ Quản trị Kinh doanh (MBA)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời hạn hợp đồng
                  </label>
                  <input
                    type="text"
                    value={formData.contractDuration}
                    onChange={(e) => handleChange("contractDuration", e.target.value)}
                    placeholder="Vô thời hạn"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lương cơ bản / Mức lương thỏa thuận
                  </label>
                  <input
                    type="text"
                    value={formData.baseSalary}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                    placeholder="Thỏa thuận Lãnh đạo cấp cao"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cấp bậc phân quyền
                  </label>
                  <select
                    value={formData.positionLevel}
                    onChange={(e) => handleChange("positionLevel", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Ban Quản Trị">Ban Quản Trị</option>
                    <option value="Trưởng Ban">Trưởng Ban</option>
                    <option value="Nhân Viên">Nhân Viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò hệ thống (Quyền truy cập)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="ADMIN">ADMIN (Quản trị viên toàn hệ thống)</option>
                    <option value="HCNS">HCNS (Quản lý Nhân sự & Chấm công)</option>
                    <option value="LEADER">LEADER (Lãnh đạo / Trưởng ban)</option>
                    <option value="USER">USER (Cán bộ nhân viên)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái nhân sự
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="active">Chính thức (Active)</option>
                    <option value="probation">Thử việc (Probation)</option>
                    <option value="invited">Đã gửi thư mời (Invited)</option>
                    <option value="leave">Nghỉ thai sản / Nghỉ chế độ</option>
                    <option value="inactive">Đã nghỉ việc (Inactive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quỹ phép năm (Số ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.annualLeaveQuota}
                    onChange={(e) => handleChange("annualLeaveQuota", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phép tồn năm trước (Số ngày)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.carriedOverLeave}
                    onChange={(e) => handleChange("carriedOverLeave", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hiệu suất KPI (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performance}
                    onChange={(e) => handleChange("performance", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dự án tham gia (Số lượng)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.projectsCount}
                    onChange={(e) => handleChange("projectsCount", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>
              </div>
              )}
            </div>
          )}

          {/* ===================== BƯỚC 3: ĐỊNH DANH & THUẾ ===================== */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#1b365d]" />
                  Định danh pháp lý, Thuế & Bảo hiểm
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Căn cước công dân (CCCD / CMND)
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                    placeholder="001095012345"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={formData.idIssueDate}
                    onChange={(e) => handleChange("idIssueDate", e.target.value)}
                    placeholder="12/04/2021"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nơi cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={formData.idIssuePlace}
                    onChange={(e) => handleChange("idIssuePlace", e.target.value)}
                    placeholder="Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã số thuế cá nhân (MST)
                  </label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => handleChange("taxCode", e.target.value)}
                    placeholder="8492019281"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cơ quan thuế quản lý
                  </label>
                  <input
                    type="text"
                    value={formData.taxAuthority}
                    onChange={(e) => handleChange("taxAuthority", e.target.value)}
                    placeholder="Chi cục Thuế TP. Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã số Bảo hiểm xã hội (BHXH)
                  </label>
                  <input
                    type="text"
                    value={formData.socialInsuranceNo}
                    onChange={(e) => handleChange("socialInsuranceNo", e.target.value)}
                    placeholder="7916291029"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã số thẻ BHYT
                  </label>
                  <input
                    type="text"
                    value={formData.healthInsuranceNo}
                    onChange={(e) => handleChange("healthInsuranceNo", e.target.value)}
                    placeholder="DN4791629102901"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bệnh viện ĐK khám chữa bệnh ban đầu
                  </label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => handleChange("hospital", e.target.value)}
                    placeholder="Bệnh viện Hữu Nghị Việt Đức"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== BƯỚC 4: LIÊN HỆ & NGÂN HÀNG ===================== */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#1b365d]" />
                  Thông tin liên hệ & Tài khoản ngân hàng
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email công việc (Email chính) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="kien.nguyen@donghaiinvest.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại di động
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email cá nhân
                  </label>
                  <input
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                    placeholder="kien8438@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ thường trú (hộ khẩu)
                  </label>
                  <input
                    type="text"
                    value={formData.permanentAddress}
                    onChange={(e) => handleChange("permanentAddress", e.target.value)}
                    placeholder="Số 68 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ hiện tại / tạm trú
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress}
                    onChange={(e) => handleChange("currentAddress", e.target.value)}
                    placeholder="Biệt thự Hoa Lan, Vinhomes Riverside, Long Biên, Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tài khoản ngân hàng
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange("bankAccount", e.target.value)}
                    placeholder="1903482910299"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    placeholder="Techcombank"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chi nhánh ngân hàng
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => handleChange("bankBranch", e.target.value)}
                    placeholder="Hội sở Ba Đình - Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Người liên hệ khẩn cấp (Họ tên)
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                    placeholder="Nguyễn Văn Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại khẩn cấp
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                    placeholder="0903 219 888"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mối quan hệ khẩn cấp
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyRelationship}
                    onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                    placeholder="Bố ruột / Vợ / Chồng / Người thân"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                <span>Tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
