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
  Loader2,
  Send,
  UserPlus,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";

interface AddEmployeeModalProps {
  departments: Array<{ name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmployee: any) => void;
}

const STEPS = [
  { id: 1, title: "Cá nhân", sub: "Lý lịch cơ bản", icon: User },
  { id: 2, title: "Công việc", sub: "Vị trí & Ban phòng", icon: Briefcase },
  { id: 3, title: "Định danh & Thuế", sub: "CCCD, MST, BHXH", icon: ShieldAlert },
  { id: 4, title: "Liên hệ & Ngân hàng", sub: "SĐT, Địa chỉ, STK", icon: PhoneCall },
];

export default function AddEmployeeModal({
  departments,
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    // Step 1: Cá nhân
    name: "",
    code: "",
    attendanceCode: "",
    gender: "Nam",
    dob: "",
    maritalStatus: "Độc thân",
    nationality: "Việt Nam",
    ethnic: "Kinh",
    religion: "Không",
    placeOfBirth: "",
    hometown: "",

    // Step 2: Công việc
    department: departments[0]?.name || "Ban Nhân sự & Hành chính Tổng hợp",
    positionLevel: "Nhân Viên",
    position: "Nhân viên",
    role: "USER",
    workLevel: "Chuyên viên",
    contractType: "Hợp đồng lao động không xác định thời hạn",
    contractDuration: "Vô thời hạn",
    joinDate: new Intl.DateTimeFormat("vi-VN").format(new Date()),
    directManager: "Trưởng Ban",
    salaryGrade: "Bậc 3",
    location: "Hà Nội",
    annualLeaveQuota: 12,
    carriedOverLeave: 0,
    usedLeave: 0,

    // Step 3: Định danh & Thuế
    idNumber: "",
    idIssueDate: "",
    idIssuePlace: "Cục Cảnh sát QLHC về TTXH",
    taxCode: "",
    taxAuthority: "Chi cục Thuế TP. Hà Nội",
    socialInsuranceNo: "",
    healthInsuranceNo: "",
    hospital: "Bệnh viện Hữu Nghị Việt Đức",

    // Step 4: Liên hệ & Ngân hàng
    email: "",
    workEmail: "",
    phone: "",
    personalEmail: "",
    permanentAddress: "",
    currentAddress: "",
    bankAccount: "",
    bankName: "Techcombank",
    bankBranch: "Hội sở Hà Nội",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelationship: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setErrorMsg(null);
      setFormData({
        name: "",
        code: "",
        attendanceCode: "",
        gender: "Nam",
        dob: "",
        maritalStatus: "Độc thân",
        nationality: "Việt Nam",
        ethnic: "Kinh",
        religion: "Không",
        placeOfBirth: "",
        hometown: "",
        department: departments[0]?.name || "Ban Nhân sự & Hành chính Tổng hợp",
        positionLevel: "Nhân Viên",
        position: "Nhân viên",
        role: "USER",
        workLevel: "Chuyên viên",
        contractType: "Hợp đồng lao động không xác định thời hạn",
        contractDuration: "Vô thời hạn",
        joinDate: new Intl.DateTimeFormat("vi-VN").format(new Date()),
        directManager: "Trưởng Ban",
        salaryGrade: "Bậc 3",
        location: "Hà Nội",
        annualLeaveQuota: 12,
        carriedOverLeave: 0,
        usedLeave: 0,
        idNumber: "",
        idIssueDate: "",
        idIssuePlace: "Cục Cảnh sát QLHC về TTXH",
        taxCode: "",
        taxAuthority: "Chi cục Thuế TP. Hà Nội",
        socialInsuranceNo: "",
        healthInsuranceNo: "",
        hospital: "Bệnh viện Hữu Nghị Việt Đức",
        email: "",
        workEmail: "",
        phone: "",
        personalEmail: "",
        permanentAddress: "",
        currentAddress: "",
        bankAccount: "",
        bankName: "Techcombank",
        bankBranch: "Hội sở Hà Nội",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyRelationship: "",
      });
    }
  }, [isOpen, departments]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setErrorMsg(null);
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePositionLevelChange = (level: string) => {
    let suggestedRole = "USER";
    let suggestedPosition = "Nhân viên";
    if (level === "Ban Quản Trị") {
      suggestedRole = "ADMIN";
      suggestedPosition = "Thành viên Ban Quản Trị";
    } else if (level === "Trưởng Ban") {
      suggestedRole = "LEADER";
      suggestedPosition = "Trưởng Ban";
    }
    setFormData((prev: any) => ({
      ...prev,
      positionLevel: level,
      role: suggestedRole,
      position:
        prev.position && prev.position !== "Nhân viên"
          ? prev.position
          : suggestedPosition,
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Vui lòng nhập Họ và Tên nhân sự để tiếp tục!");
        return;
      }
    }
    setErrorMsg(null);
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      setCurrentStep(1);
      setErrorMsg("Vui lòng nhập Họ và Tên!");
      return;
    }
    if (!formData.email?.trim()) {
      setCurrentStep(4);
      setErrorMsg("Vui lòng nhập Email Thư mời (bắt buộc)!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        workEmail: formData.workEmail || formData.email,
      };

      const res = await fetch("http://localhost:5002/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Không thể thêm nhân viên!");
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối Backend!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      hideHeader
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1b365d] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Thêm Cán Bộ Nhân Sự Mới
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khởi tạo hồ sơ & cấp tài khoản gia nhập Đông Hải Invest
              </p>
            </div>
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
                  onClick={() => {
                    if (currentStep === 1 && !formData.name.trim() && step.id > 1) {
                      setErrorMsg("Vui lòng nhập Họ và Tên nhân sự trước!");
                      return;
                    }
                    setErrorMsg(null);
                    setCurrentStep(step.id);
                  }}
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center justify-between animate-in fade-in">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Lê Hoàng Nam"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã nhân sự (Để trống sẽ tự sinh)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    placeholder="Tự động: DHI-004..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email công việc (Email chính) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="nam.le@donghaiinvest.vn"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mã chấm công (Máy chấm công)</span>
                    <span className="text-[10px] text-blue-600 font-normal">Tự động khớp công</span>
                  </label>
                  <input
                    type="text"
                    value={formData.attendanceCode}
                    onChange={(e) => handleChange("attendanceCode", e.target.value)}
                    placeholder="VD: 3, 6, 11, 14..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-blue-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-mono font-bold"
                  />
                </div>

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
                    placeholder="VD: TP. Hà Nội"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quê quán / Nguyên quán
                  </label>
                  <input
                    type="text"
                    value={formData.hometown}
                    onChange={(e) => handleChange("hometown", e.target.value)}
                    placeholder="VD: Hàng Bạc, Hoàn Kiếm, Hà Nội"
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
                  Thông tin vị trí & công tác
                </h4>
              </div>

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
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cấp Bậc Chức Danh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.positionLevel}
                    onChange={(e) => handlePositionLevelChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Ban Quản Trị">Ban Quản Trị</option>
                    <option value="Trưởng Ban">Trưởng Ban</option>
                    <option value="Nhân Viên">Nhân Viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quyền Tài Khoản (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-semibold text-[#1b365d]"
                  >
                    <option value="ADMIN">Quản trị viên (Admin - Toàn quyền)</option>
                    <option value="HCNS">Quản lý Nhân sự (HCNS - Quản lý nhân sự & công)</option>
                    <option value="LEADER">Trưởng ban (Leader - Duyệt đơn & QL ban)</option>
                    <option value="USER">Nhân viên (User - Xem & nộp đơn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức Vụ Hiển Thị Cụ Thể <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    placeholder="VD: Trưởng Ban Hành chính - Nhân sự..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-semibold"
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
                    Văn Phòng Trực Thuộc
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Hà Nội">Hà Nội (Trụ sở chính)</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngạch Lương / Bậc Lương
                  </label>
                  <select
                    value={formData.salaryGrade}
                    onChange={(e) => handleChange("salaryGrade", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  >
                    <option value="Bậc 1">Bậc 1</option>
                    <option value="Bậc 2">Bậc 2</option>
                    <option value="Bậc 3">Bậc 3</option>
                    <option value="Bậc 4">Bậc 4</option>
                    <option value="Bậc 5">Bậc 5</option>
                    <option value="Bậc 6">Bậc 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trình độ học vấn
                  </label>
                  <input
                    type="text"
                    value={formData.education || ""}
                    onChange={(e) => handleChange("education", e.target.value)}
                    placeholder="VD: Cử nhân, Thạc sĩ QTKD..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lương cơ bản / Thỏa thuận
                  </label>
                  <input
                    type="text"
                    value={formData.baseSalary || ""}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                    placeholder="VD: 15.000.000 đ"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all font-semibold"
                  />
                </div>

                {/* Cấu hình Quỹ Phép Năm */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">
                      Quỹ Phép Năm (Nhập tay linh hoạt)
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1b365d] text-white">
                      Còn lại:{" "}
                      {Math.max(
                        0,
                        Number(formData.annualLeaveQuota || 0) +
                          Number(formData.carriedOverLeave || 0) -
                          Number(formData.usedLeave || 0)
                      )}{" "}
                      ngày
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">
                        Phép năm cấp
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={formData.annualLeaveQuota}
                        onChange={(e) =>
                          handleChange("annualLeaveQuota", Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">
                        Phép tồn năm trước
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={formData.carriedOverLeave}
                        onChange={(e) =>
                          handleChange("carriedOverLeave", Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">
                        Đã sử dụng
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={formData.usedLeave}
                        onChange={(e) =>
                          handleChange("usedLeave", Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Thư Mời / Công Việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="nam.le@donghaiinvest.vn"
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
                    placeholder="nam.le.personal@gmail.com"
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

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
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
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? "Đang khởi tạo..." : "Tạo & Gửi Thư Mời"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
