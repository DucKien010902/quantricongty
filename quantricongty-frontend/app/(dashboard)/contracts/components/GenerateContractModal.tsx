"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  FileSignature,
  User,
  Building,
  Calendar,
  DollarSign,
  Download,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  ArrowRight,
  Edit3,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { Employee } from "@/app/data/seed-employees";
import { API_URL } from "@/app/config/api";
import {
  numberToVietnameseWords,
  generateContractDocx,
  downloadFile,
  fixVietnameseEncoding,
} from "../utils/contractGenerator";
import { createSampleContractDocx } from "../utils/sampleTemplateDocx";

export interface BackendTemplate {
  _id?: string;
  id?: string;
  name: string;
  category: "labor" | "probation" | "economic" | "service";
  fileName: string;
  fileUrl: string;
  objectKey?: string;
  fileSize: string;
  description?: string;
  isSystemDefault?: boolean;
}

interface GenerateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: BackendTemplate[];
  employees: Employee[];
  company: any;
  preselectedTemplate?: BackendTemplate | null;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}


export default function GenerateContractModal({
  isOpen,
  onClose,
  templates,
  employees,
  company,
  preselectedTemplate,
  onSuccess,
  showToast,
}: GenerateContractModalProps) {
  const [activeView, setActiveView] = useState<"form" | "preview">("form");

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplate ? (preselectedTemplate._id || preselectedTemplate.id || "") : (templates[0]?._id || templates[0]?.id || "")
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [contractCode, setContractCode] = useState<string>(
    `HĐLĐ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [contractType, setContractType] = useState<string>(
    "Hợp đồng lao động xác định thời hạn 12 tháng"
  );
  const [contractDuration, setContractDuration] = useState<string>("12 tháng");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [signDate, setSignDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [salaryNum, setSalaryNum] = useState<number>(18000000);
  const [workLocation, setWorkLocation] = useState<string>(
    "Trụ sở công ty và theo điều động công tác của Ban Lãnh Đạo"
  );

  // Representative info (Bên A)
  const [repName, setRepName] = useState<string>("Ông DƯƠNG THÀNH LONG");
  const [repPosition, setRepPosition] = useState<string>("Chủ tịch HĐQT");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Sync preselected template if changed
  useEffect(() => {
    if (preselectedTemplate) {
      setSelectedTemplateId(preselectedTemplate._id || preselectedTemplate.id || "");
    } else if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0]._id || templates[0].id || "");
    }
  }, [preselectedTemplate, templates]);

  // Selected Employee object
  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Selected Template object
  const currentTemplate = useMemo(() => {
    return templates.find((t) => (t._id || t.id) === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  // Auto-fill salary from employee if available
  useEffect(() => {
    if (currentEmployee) {
      if (currentEmployee.baseSalary) {
        const cleanSalary = parseInt(
          String(currentEmployee.baseSalary).replace(/\D/g, ""),
          10
        );
        if (!isNaN(cleanSalary) && cleanSalary > 0) {
          setSalaryNum(cleanSalary);
        }
      }
    }
  }, [currentEmployee]);

  // Read salary in words
  const salaryInWords = useMemo(() => {
    return numberToVietnameseWords(salaryNum);
  }, [salaryNum]);

  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
  const formatDateVN = (iso: string) => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  };

  // Build mapping dictionary
  const templateData = useMemo(() => {
    const signParts = signDate.split("-");
    const signDay = signParts[2] || "23";
    const signMonth = signParts[1] || "09";
    const signYear = signParts[0] || "2026";

    const empName = currentEmployee ? currentEmployee.name : "Nguyễn Văn A";
    const empGender = currentEmployee ? currentEmployee.gender : "Nam";
    const empDob = currentEmployee?.dob || "01/01/1995";
    const empPhone = currentEmployee?.phone || "0986 399 977";
    const empEmail = currentEmployee?.email || "nhanvien@donghai.vn";
    const empDept = currentEmployee?.department || "Ban Kỹ Thuật";
    const empPos = currentEmployee?.position || "Chuyên viên";
    const empIdNum = currentEmployee?.idNumber || "001202012345";
    const empIdDate = currentEmployee?.idIssueDate || "10/05/2021";
    const empIdPlace = currentEmployee?.idIssuePlace || "Cục Cảnh sát QLHC về TTXH";
    const empCountry = currentEmployee?.nationality || "Việt Nam";
    const empAddress =
      currentEmployee?.permanentAddress ||
      "CH E 2.15.6, The Emerald, CT8, KDDTM Mỹ Đình-Mễ Trì, Phường Từ Liêm, TP. Hà Nội";
    const empCurrentAddr =
      currentEmployee?.currentAddress ||
      "CH E 2.15.6, The Emerald, CT8, KDDTM Mỹ Đình-Mễ Trì, Phường Từ Liêm, TP. Hà Nội";
    const empBankAcc = currentEmployee?.bankAccount || "1903456789012";
    const empBankName = currentEmployee?.bankName || "Techcombank - CN Hà Nội";

    const compName = company?.name || "CÔNG TY CỔ PHẦN ĐÔNG HẢI INVEST";
    const compAddress =
      company?.address ||
      "Tầng 2, Tòa nhà CT3, Khu ĐTM Nghĩa Đô, Phường Nghĩa Đô, TP Hà Nội, Việt Nam";
    const compPhone = company?.phone || "0986 399 977";
    const compTax = company?.taxCode || "0108998877";

    return {
      employee: {
        fullName: empName,
        name: empName,
        code: currentEmployee?.code || "NV001",
        gender: empGender,
        dob: empDob,
        identityCard: empIdNum,
        idNumber: empIdNum,
        identityDate: empIdDate,
        idIssueDate: empIdDate,
        identityPlace: empIdPlace,
        idIssuePlace: empIdPlace,
        country: empCountry,
        nationality: empCountry,
        ethnic: currentEmployee?.ethnic || "Kinh",
        religion: currentEmployee?.religion || "Không",
        maritalStatus: currentEmployee?.maritalStatus || "Độc thân",
        education: currentEmployee?.education || "Đại học",
        address: empAddress,
        permanentAddress: empAddress,
        currentAddress: empCurrentAddr,
        workPhone: empPhone,
        phone: empPhone,
        email: empEmail,
        personalEmail: currentEmployee?.personalEmail || empEmail,
        department: empDept,
        position: empPos,
        positionLevel: currentEmployee?.positionLevel || "Nhân Viên",
        taxCode: currentEmployee?.taxCode || "",
        socialInsuranceNo: currentEmployee?.socialInsuranceNo || "",
        healthInsuranceNo: currentEmployee?.healthInsuranceNo || "",
        bankAccount: empBankAcc,
        bankName: empBankName,
        bankBranch: currentEmployee?.bankBranch || "",
      },
      company: {
        name: compName,
        brandName: company?.brandName || "DONG HAI INVEST",
        address: compAddress,
        phone: compPhone,
        taxCode: compTax,
        email: company?.email || "contact@donghaiinvest.vn",
        representative: repName,
        representativePosition: repPosition,
      },
      contract: {
        code: contractCode,
        type: contractType,
        duration: contractDuration,
        startDate: formatDateVN(startDate),
        endDate: formatDateVN(endDate),
        signDate: formatDateVN(signDate),
        signDay: signDay,
        signMonth: signMonth,
        signYear: signYear,
        salary: `${salaryNum.toLocaleString("vi-VN")} VNĐ`,
        salaryNumber: salaryNum.toLocaleString("vi-VN"),
        salaryInWords: salaryInWords,
        salaryWords: salaryInWords,
        probationSalary: `${Math.round(salaryNum * 0.85).toLocaleString("vi-VN")} VNĐ (85%)`,
        workLocation: workLocation,
        workTime: "Từ 08:00 đến 17:00, từ Thứ Hai đến Thứ Sáu hàng tuần",
      },
    };
  }, [
    currentEmployee,
    company,
    contractCode,
    contractType,
    contractDuration,
    startDate,
    endDate,
    signDate,
    salaryNum,
    salaryInWords,
    workLocation,
    repName,
    repPosition,
  ]);

  const handleGenerate = async () => {
    if (!selectedEmployeeId) {
      showToast("Vui lòng chọn nhân sự cần ký hợp đồng!");
      setActiveView("form");
      return;
    }

    setIsGenerating(true);
    try {
      let buffer: ArrayBuffer;

      // 1. Tải template buffer: nếu có URL MinIO thì fetch, nếu không thì dùng mẫu chuẩn
      if (currentTemplate && currentTemplate.fileUrl) {
        try {
          const res = await fetch(currentTemplate.fileUrl);
          if (res.ok) {
            buffer = await res.arrayBuffer();
          } else {
            const sampleBlob = createSampleContractDocx();
            buffer = await sampleBlob.arrayBuffer();
          }
        } catch {
          const sampleBlob = createSampleContractDocx();
          buffer = await sampleBlob.arrayBuffer();
        }
      } else {
        const sampleBlob = createSampleContractDocx();
        buffer = await sampleBlob.arrayBuffer();
      }

      // 2. Trộn dữ liệu vào Docx
      const outputBlob = generateContractDocx(buffer, templateData);
      const safeEmpName = (currentEmployee?.name || "NhanVien").replace(/\s+/g, "_");
      const fileName = `${contractCode}_${safeEmpName}.docx`;

      // 3. Tải file về máy người dùng ngay lập tức
      downloadFile(outputBlob, fileName);

      // 4. Gửi lên Backend để lưu trữ file trên MinIO và lưu bản ghi vào MongoDB
      const formData = new FormData();
      formData.append("file", outputBlob, fileName);
      formData.append("code", contractCode);
      formData.append("title", `${contractType} - ${currentEmployee?.name}`);
      formData.append("category", currentTemplate?.category || "labor");
      formData.append("templateId", currentTemplate?._id || currentTemplate?.id || "");
      formData.append("templateName", currentTemplate?.name || "Mẫu chuẩn hệ thống");
      formData.append("employeeId", currentEmployee?.id || "");
      formData.append("employeeName", currentEmployee?.name || "");
      formData.append("partyB", currentEmployee?.name || "");
      formData.append("partyBType", "employee");
      formData.append("salary", String(salaryNum));
      formData.append("startDate", formatDateVN(startDate));
      formData.append("endDate", formatDateVN(endDate));
      formData.append("signDate", formatDateVN(signDate));
      formData.append("status", "active");
      formData.append("author", "Ban Pháp Chế & Nhân Sự");

      await fetch(`${API_URL}/contracts`, {
        method: "POST",
        body: formData,
      });

      showToast(`Đã sinh hợp đồng "${contractCode}", tải xuống file Word và lưu trữ thành công lên MinIO!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Không thể sinh file Word. Vui lòng kiểm tra lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" hideHeader className="p-0 overflow-hidden">
      <div className="flex flex-col h-[90vh] max-h-[850px] bg-slate-50 overflow-hidden">
        {/* HEADER */}
        <div className="p-4 px-6 bg-[#1b365d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-blue-200">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Sinh Hợp Đồng Tự Động Từ Mẫu Word</h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Đổ dữ liệu nhân sự thực tế vào các thẻ {"{{...}}"} và xuất file Word hoàn chỉnh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TOGGLE VIEW TABS */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveView("form")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === "form" ? "bg-white text-[#1b365d] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>1. Điền thông tin</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === "preview" ? "bg-white text-[#1b365d] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. Xem trước hợp đồng</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeView === "form" ? (
            /* TAB 1: FORM ĐIỀN THÔNG TIN */
            <div className="space-y-5">
              {/* SECTION 1: CHỌN MẪU & CHỌN NHÂN SỰ */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1b365d] flex items-center justify-center text-[11px] font-extrabold">
                    1
                  </span>
                  Chọn Mẫu Hợp Đồng & Người Lao Động (Bên B)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chọn Template */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Biểu mẫu Word (.docx) (*)
                    </label>
                    <select
                      required
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] cursor-pointer"
                    >
                      {templates.length === 0 && (
                        <option value="default">Biểu mẫu HĐLĐ chuẩn doanh nghiệp (Mặc định)</option>
                      )}
                      {templates.map((t) => (
                        <option key={t._id || t.id} value={t._id || t.id}>
                          {fixVietnameseEncoding(t.name)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {templates.length > 0
                        ? `Có ${templates.length} biểu mẫu đã lưu trên MinIO`
                        : "Đang dùng biểu mẫu chuẩn hệ thống"}
                    </p>
                  </div>

                  {/* Chọn Nhân sự */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chọn nhân sự ký kết (*)
                    </label>
                    <select
                      required
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] cursor-pointer"
                    >
                      <option value="">-- Nhấp để chọn nhân viên từ danh sách công ty --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position || "Nhân viên"} ({emp.department})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dữ liệu CCCD, ngày sinh, địa chỉ, email sẽ tự động điền
                    </p>
                  </div>
                </div>

                {/* Thẻ xem nhanh thông tin nhân viên đã chọn */}
                {currentEmployee && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1b365d] flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {currentEmployee.name} ({currentEmployee.gender})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Ngày sinh: {currentEmployee.dob || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400">Số CCCD:</span>{" "}
                        <strong>{currentEmployee.idNumber || "001202012345"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Điện thoại:</span>{" "}
                        <strong>{currentEmployee.phone || "0986 399 977"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span>{" "}
                        <strong>{currentEmployee.email || "kiennd@donghai.vn"}</strong>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      <span className="text-slate-400">Thường trú:</span>{" "}
                      {currentEmployee.permanentAddress || "CH E 2.15.6, The Emerald, Mỹ Đình, Hà Nội"}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ĐIỀU KHOẢN HỢP ĐỒNG & CHẾ ĐỘ LƯƠNG */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1b365d] flex items-center justify-center text-[11px] font-extrabold">
                    2
                  </span>
                  Thiết Lập Điều Khoản Hợp Đồng & Lương
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số hiệu hợp đồng (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={contractCode}
                      onChange={(e) => setContractCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#1b365d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên loại hợp đồng (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời hạn hợp đồng
                    </label>
                    <input
                      type="text"
                      value={contractDuration}
                      onChange={(e) => setContractDuration(e.target.value)}
                      placeholder="Ví dụ: 12 tháng, 02 tháng thử việc..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày bắt đầu làm việc
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày kết thúc hợp đồng
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày ký hợp đồng
                    </label>
                    <input
                      type="date"
                      value={signDate}
                      onChange={(e) => setSignDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>
                </div>

                {/* Mức lương */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Mức lương chính thức (VNĐ) (*)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100000}
                        value={salaryNum}
                        onChange={(e) => setSalaryNum(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-sm font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-emerald-900 mb-1">
                        Số tiền bằng chữ (Tự động chuyển đổi):
                      </span>
                      <div className="px-3.5 py-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 italic">
                        {salaryInWords}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BÊN A (NGƯỜI ĐẠI DIỆN CÔNG TY) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1b365d] flex items-center justify-center text-[11px] font-extrabold">
                    3
                  </span>
                  Người Đại Diện Doanh Nghiệp Ký Kết (Bên A)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên người đại diện (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chức vụ người đại diện (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={repPosition}
                      onChange={(e) => setRepPosition(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: XEM TRƯỚC VĂN BẢN HỢP ĐỒNG (A4 DOCUMENT PREVIEW) */
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Toàn bộ thẻ biến <strong>{"{{...}}"}</strong> đã được thay thế bằng dữ liệu thực tế của <strong>{templateData.employee.fullName}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("form")}
                  className="text-xs font-bold text-[#1b365d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa lại thông tin
                </button>
              </div>

              {/* KHUNG A4 TRỰC QUAN */}
              <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-sm max-w-3xl mx-auto text-slate-900 font-serif leading-relaxed text-[13px] space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-sm uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold text-sm">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-slate-400">---------------------------------</p>
                </div>

                <div className="text-center pt-2 space-y-1">
                  <h2 className="font-bold text-lg uppercase tracking-wide">HỢP ĐỒNG LAO ĐỘNG</h2>
                  <p className="font-mono text-xs text-slate-600 font-bold">Số: {templateData.contract.code}</p>
                </div>

                <p className="pt-2 italic">
                  Hôm nay, ngày {templateData.contract.signDay} tháng {templateData.contract.signMonth} năm {templateData.contract.signYear}, tại {templateData.company.address}, chúng tôi gồm có:
                </p>

                {/* BÊN A */}
                <div className="space-y-1 border-l-2 border-[#1b365d] pl-3 py-1 bg-slate-50/50">
                  <p className="font-bold uppercase text-xs text-[#1b365d]">BÊN A - NGƯỜI SỬ DỤNG LAO ĐỘNG (CÔNG TY):</p>
                  <p>Tên doanh nghiệp: <strong>{templateData.company.name}</strong></p>
                  <p>Địa chỉ trụ sở: {templateData.company.address}</p>
                  <p>Điện thoại: {templateData.company.phone} • Mã số thuế: {templateData.company.taxCode}</p>
                  <p>Người đại diện: <strong>{templateData.company.representative}</strong> — Chức vụ: <strong>{templateData.company.representativePosition}</strong></p>
                  <p className="text-xs text-slate-500 italic">(sau đây gọi tắt là “Người sử dụng lao động” hoặc “Công ty”)</p>
                </div>

                {/* BÊN B */}
                <div className="space-y-1 border-l-2 border-emerald-600 pl-3 py-1 bg-slate-50/50">
                  <p className="font-bold uppercase text-xs text-emerald-800">BÊN B - NGƯỜI LAO ĐỘNG:</p>
                  <p>Họ và tên: <strong>{templateData.employee.fullName}</strong> — Giới tính: <strong>{templateData.employee.gender}</strong></p>
                  <p>Ngày sinh: {templateData.employee.dob} • Quốc tịch: {templateData.employee.country}</p>
                  <p>Số CMND/CCCD: <strong>{templateData.employee.identityCard}</strong> • Cấp ngày: {templateData.employee.identityDate} • Tại: {templateData.employee.identityPlace}</p>
                  <p>Hộ khẩu thường trú: {templateData.employee.address}</p>
                  <p>Địa chỉ chỗ ở hiện nay: {templateData.employee.currentAddress}</p>
                  <p>Điện thoại: {templateData.employee.workPhone} • Email: {templateData.employee.email}</p>
                  <p className="text-xs text-slate-500 italic">(sau đây gọi tắt là “Người lao động”)</p>
                </div>

                {/* ĐIỀU KHOẢN */}
                <div className="pt-2 space-y-3">
                  <div>
                    <p className="font-bold uppercase text-xs">ĐIỀU 1: THỜI HẠN VÀ CÔNG VIỆC HỢP ĐỒNG</p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800">
                      <li>Loại hợp đồng: <strong>{templateData.contract.type}</strong></li>
                      <li>Thời hạn hợp đồng: <strong>{templateData.contract.duration}</strong></li>
                      <li>Hiệu lực: Từ ngày <strong>{templateData.contract.startDate}</strong> đến hết ngày <strong>{templateData.contract.endDate}</strong>.</li>
                      <li>Chức danh chuyên môn: <strong>{templateData.employee.position}</strong> (Phòng ban: <strong>{templateData.employee.department}</strong>).</li>
                      <li>Địa điểm làm việc: {templateData.contract.workLocation}.</li>
                      <li>Thời giờ làm việc: {templateData.contract.workTime}.</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-bold uppercase text-xs">ĐIỀU 2: CHẾ ĐỘ TIỀN LƯƠNG VÀ ĐÃI NGỘ</p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800">
                      <li>Mức lương chính thức: <strong className="text-emerald-800">{templateData.contract.salary}</strong></li>
                      <li>Số tiền bằng chữ: <em>{templateData.contract.salaryInWords}</em></li>
                      <li>Mức lương trong thời gian thử việc: <strong>{templateData.contract.probationSalary}</strong></li>
                      <li>Tài khoản nhận lương: {templateData.employee.bankAccount} tại {templateData.employee.bankName}.</li>
                    </ul>
                  </div>
                </div>

                {/* CHỮ KÝ */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs font-sans">
                  <div>
                    <p className="font-bold uppercase">ĐẠI DIỆN BÊN A</p>
                    <p className="text-slate-500 italic text-[11px]">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <div className="h-16 flex items-end justify-center">
                      <p className="font-bold text-sm text-slate-900">{templateData.company.representative}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold uppercase">NGƯỜI LAO ĐỘNG (BÊN B)</p>
                    <p className="text-slate-500 italic text-[11px]">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center">
                      <p className="font-bold text-sm text-slate-900">{templateData.employee.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>

            {activeView === "form" ? (
              <button
                type="button"
                onClick={() => {
                  if (!selectedEmployeeId) {
                    showToast("Vui lòng chọn nhân viên trước khi xem trước!");
                    return;
                  }
                  setActiveView("preview");
                }}
                className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-[#1b365d] hover:bg-blue-100 font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Eye className="w-4 h-4" />
                <span>Xem trước văn bản hợp đồng</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView("form")}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Quay lại chỉnh sửa</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedEmployeeId}
            className="px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-[#1b365d]/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý & lưu MinIO...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Xác Nhận Tạo & Tải Tệp Word (.docx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
