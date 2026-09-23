"use client";
import { API_URL } from "@/app/config/api";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Users,
  Briefcase,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { COMPANY_DEPARTMENTS, DepartmentInfo } from "@/app/data/seed-employees";

interface SetupWizardProps {
  currentUser: any;
  onComplete: (setupData: {
    company: any;
    departments: any[];
    employees: any[];
  }) => void;
  onCancel?: () => void;
}

export default function CompanySetupWizard({
  currentUser,
  onComplete,
  onCancel,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // BƯỚC 1: HỒ SƠ DOANH NGHIỆP MỚI (Để trống để Admin tự điền)
  const [companyData, setCompanyData] = useState({
    name: "",
    brandName: "",
    taxCode: "",
    businessSector: "",
    address: "",
    email: currentUser?.email || "",
    phone: "",
    logoUrl: "/donghai-logo.png",
  });

  // BƯỚC 2: CƠ CẤU BAN / PHÒNG & CHỨC DANH
  // Gợi ý danh sách ban phòng ban đầu linh hoạt
  const [departments, setDepartments] = useState<DepartmentInfo[]>([
    {
      id: "dept-1",
      name: "Ban Giám Đốc",
      code: "BGD",
      description: "Ban Lãnh đạo điều hành chiến lược chung",
      managerName: currentUser?.name || "Admin",
      color: "bg-blue-600",
    },
    {
      id: "dept-2",
      name: "Phòng Kinh Doanh",
      code: "KD",
      description: "Phát triển thị trường, khách hàng và doanh thu",
      managerName: "Đang bổ nhiệm",
      color: "bg-emerald-600",
    },
    {
      id: "dept-3",
      name: "Phòng Kế Toán - Tài Chính",
      code: "KT",
      description: "Quản trị dòng tiền, chi phí và kế toán doanh nghiệp",
      managerName: "Đang bổ nhiệm",
      color: "bg-indigo-600",
    },
    {
      id: "dept-4",
      name: "Phòng Hành Chính - Nhân Sự",
      code: "HCNS",
      description: "Tuyển dụng, chế độ đãi ngộ và quản trị văn phòng",
      managerName: "Đang bổ nhiệm",
      color: "bg-rose-600",
    },
  ]);

  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept: DepartmentInfo = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim() || `PB-${newDeptName.substring(0, 3).toUpperCase()}`,
      description: newDeptDesc.trim() || "Thực hiện chức năng chuyên môn",
      managerName: "Đang bổ nhiệm",
      color: "bg-blue-600",
    };
    setDepartments([...departments, newDept]);
    setNewDeptName("");
    setNewDeptCode("");
    setNewDeptDesc("");
  };

  const handleRemoveDepartment = (index: number) => {
    if (departments.length <= 1) {
      alert("Công ty cần ít nhất một ban / phòng chức năng!");
      return;
    }
    setDepartments(departments.filter((_, i) => i !== index));
  };

  // BƯỚC 3: NHÂN SỰ & GÁN CHỨC DANH (Bắt đầu với danh sách sạch để Admin tự thêm hoặc import)
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    phone: "",
    department: departments[0]?.name || "Ban Giám Đốc",
    position: "Chuyên viên",
  });

  const handleAddEmployee = () => {
    if (!newEmp.name.trim() || !newEmp.email.trim()) {
      alert("Vui lòng nhập họ tên và email nhân sự!");
      return;
    }
    const empToAdd = {
      ...newEmp,
      role: "ADMIN", // Ban đầu cấp quyền như admin theo yêu cầu
      inviteToken: `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
    setEmployeeList([...employeeList, empToAdd]);
    setNewEmp({
      name: "",
      email: "",
      phone: "",
      department: departments[0]?.name || "Công Nghệ Thông Tin",
      position: "Chuyên viên",
    });
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployeeList(employeeList.filter((_, i) => i !== index));
  };

  // Giả lập Import file Excel
  const handleSimulateExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const excelMocks = [
      {
        name: "Hoàng Văn Tuấn",
        email: "tuan.hoang@donghaiinvest.vn",
        phone: "0977 111 222",
        department: "Tài Chính - Kế Toán",
        position: "Kế toán trưởng",
        role: "ADMIN",
        inviteToken: "INV-TUANHV",
      },
      {
        name: "Đỗ Gia Bảo",
        email: "giabao.do@donghaiinvest.vn",
        phone: "0933 666 999",
        department: "Kinh Doanh & Phát Triển",
        position: "Chuyên viên Khách hàng",
        role: "ADMIN",
        inviteToken: "INV-BAODG",
      },
    ];
    setEmployeeList((prev) => [...prev, ...excelMocks]);
    alert(`Đã nhập thành công ${excelMocks.length} nhân sự từ file: ${file.name}`);
  };

  // BƯỚC 4: HOÀN TẤT & PHÁT HÀNH THƯ MỜI
  const companyDisplayName = companyData.name.trim() || "Công ty Mới";
  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/?join=${encodeURIComponent(companyDisplayName)}&taxCode=${encodeURIComponent(companyData.taxCode || "")}`
    : `http://localhost:3000/?join=${encodeURIComponent(companyDisplayName)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNextStep1 = () => {
    if (!companyData.name.trim()) {
      alert("Vui lòng nhập Tên đầy đủ của công ty / doanh nghiệp của bạn!");
      return;
    }
    setCurrentStep(2);
  };

  const handleFinishSetup = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        company: companyData,
        departments,
        employees: employeeList,
      };

      // Gửi lên Backend API
      await fetch(`${API_URL}/company/init-wizard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      onComplete(payload);
    } catch {
      // Fallback nếu backend chưa bật
      onComplete({
        company: companyData,
        departments,
        employees: employeeList,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Hồ sơ công ty", desc: "Tên & pháp lý" },
    { num: 2, title: "Cơ cấu tổ chức", desc: "Ban phòng & chức danh" },
    { num: 3, title: "Thêm nhân sự", desc: "Thủ công hoặc Excel" },
    { num: 4, title: "Mời gia nhập", desc: "Gửi link & hoàn tất" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      {/* Header Wizard */}
      <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/donghai-logo.png"
              alt="Logo Đông Hải"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1b365d] leading-tight">
              Khởi Tạo Tổ Chức Doanh Nghiệp
            </h1>
            <p className="text-[11px] text-slate-400">
              Thiết lập hệ thống quản trị & điều hành chuyên nghiệp
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng Wizard
          </button>
        )}
      </header>

      {/* Main Stepper Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Progress Bar / Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-white border-[#1b365d] shadow-sm ring-1 ring-[#1b365d]"
                    : isDone
                    ? "bg-emerald-50/60 border-emerald-200 cursor-pointer"
                    : "bg-white/60 border-slate-200/80 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#1b365d] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP 1: HỒ SƠ CÔNG TY */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1b365d]" />
                Bước 1: Khởi Tạo Hồ Sơ Công Ty
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Điền thông tin pháp lý và nhận diện thương hiệu để thiết lập danh tính tổ chức
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đầy đủ của công ty / doanh nghiệp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Công ty Cổ phần Đầu tư Công nghệ Đông Hải"
                  value={companyData.name}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên thương hiệu viết tắt (hoặc tên ngắn gọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: DONG HAI TECH / ĐÔNG HẢI"
                  value={companyData.brandName}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, brandName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mã số thuế doanh nghiệp
                </label>
                <input
                  type="text"
                  placeholder="VD: 0109988776"
                  value={companyData.taxCode}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, taxCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Lĩnh vực hoạt động chính
                </label>
                <input
                  type="text"
                  placeholder="VD: Công nghệ phần mềm, Thương mại dịch vụ, Bất động sản..."
                  value={companyData.businessSector}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      businessSector: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Địa chỉ trụ sở chính
                </label>
                <input
                  type="text"
                  placeholder="VD: Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM"
                  value={companyData.address}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email liên hệ chính thức
                </label>
                <input
                  type="email"
                  placeholder="contact@congty.vn"
                  value={companyData.email}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số điện thoại đại diện
                </label>
                <input
                  type="text"
                  placeholder="024 3888 xxxx"
                  value={companyData.phone}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep1}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Tiếp tục: Thiết lập Ban / Phòng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CƠ CẤU BAN / PHÒNG & CHỨC DANH */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1b365d]" />
                  Bước 2: Cơ Cấu Ban / Phòng & Khối Chuyên Môn
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Chọn khung cơ cấu có sẵn hoặc thêm mới các ban phòng phù hợp với mô hình công ty
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1b365d]">
                {departments.length} ban phòng
              </span>
            </div>

            {/* Danh sách ban phòng hiện tại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {dept.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {dept.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {dept.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveDepartment(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Xóa ban phòng này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form thêm ban phòng mới */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/80 space-y-3">
              <h4 className="text-xs font-bold text-[#1b365d] flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Thêm Ban / Phòng mới
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Tên Ban / Phòng (VD: Ban Dự Án)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
                <input
                  type="text"
                  placeholder="Mã viết tắt (VD: DHI-PRJ)"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
                <input
                  type="text"
                  placeholder="Chức năng nhiệm vụ..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-4 py-2 rounded-xl bg-[#1b365d] text-white text-xs font-semibold hover:bg-[#152a4a] transition-colors"
              >
                + Thêm vào cơ cấu
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Tiếp tục: Thêm nhân sự</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: THÊM NHÂN SỰ & GÁN CHỨC DANH */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1b365d]" />
                  Bước 3: Thêm Cán Bộ & Gán Chức Danh Ban Đầu
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Thêm trực tiếp hoặc tải file Excel mẫu để nhập danh sách nhân viên hàng loạt
                </p>
              </div>

              {/* Nút Import Excel */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold cursor-pointer transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Nhập từ Excel</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleSimulateExcelImport}
                  />
                </label>
              </div>
            </div>

            {/* Form thêm thủ công 1 nhân sự */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-700">Thêm từng nhân sự:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
                <input
                  type="email"
                  placeholder="Email nhận lời mời *"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
                <select
                  value={newEmp.department}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, department: e.target.value })
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                >
                  {departments.map((d, i) => (
                    <option key={i} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Chức danh (VD: Chuyên viên)"
                  value={newEmp.position}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, position: e.target.value })
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="px-4 py-2 rounded-xl bg-[#1b365d] text-white font-semibold hover:bg-[#152a4a] transition-colors"
                >
                  + Thêm vào danh sách
                </button>
              </div>
            </div>

            {/* Bảng danh sách nhân sự đã thêm */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Danh sách cán bộ sẵn sàng mời ({employeeList.length}):</span>
                <span className="text-[11px] font-medium text-slate-400">
                  * Quyền hạn ban đầu: Toàn quyền (Admin)
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {employeeList.map((emp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1b365d] font-bold flex items-center justify-center flex-shrink-0">
                        {emp.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {emp.email} • {emp.phone || "Chưa có SĐT"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {emp.department}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1b365d] font-semibold text-[11px]">
                        {emp.position}
                      </span>
                      <button
                        onClick={() => handleRemoveEmployee(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Tiếp tục: Phát hành thư mời</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHÁT HÀNH THƯ MỜI & HOÀN TẤT */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1b365d]" />
                Bước 4: Phát Hành Thư Mời & Kích Hoạt Tổ Chức
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gửi link lời mời qua Email hoặc sao chép Link trực tiếp để gửi cán bộ đăng nhập ngay
              </p>
            </div>

            {/* Khối Copy Link mời trực tiếp */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b365d] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Đường dẫn mời tham gia công ty (Invite Link)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Hiệu lực: Vĩnh viễn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold transition-colors flex-shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                👉 Gửi đường link này qua Email, Zalo hoặc tin nhắn. Cán bộ bấm vào link sẽ được chào đón và đăng nhập vào công ty với quyền Admin ban đầu.
              </p>
            </div>

            {/* Tóm tắt thông tin đã thiết lập */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-medium">Doanh nghiệp</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                  {companyData.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  MST: {companyData.taxCode}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-medium">Cơ cấu tổ chức</p>
                <p className="font-bold text-[#1b365d] text-sm mt-0.5">
                  {departments.length} Ban / Phòng
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Đã phân chia khối chuyên môn
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-medium">Quân số khởi tạo</p>
                <p className="font-bold text-emerald-600 text-sm mt-0.5">
                  {employeeList.length} Nhân sự
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Đã gán chức danh & mã mời
                </p>
              </div>
            </div>

            {/* Nút Hoàn tất */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishSetup}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isSubmitting
                    ? "Đang lưu cấu hình..."
                    : "Hoàn Tất Khởi Tạo & Vào Trang Điều Hành"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer nhỏ */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        Hệ thống Quản trị & Điều hành Doanh nghiệp Đông Hải • Phiên bản 2026
      </footer>
    </div>
  );
}
