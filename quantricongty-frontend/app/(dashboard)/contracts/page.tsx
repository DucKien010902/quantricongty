"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileSignature,
  Search,
  Download,
  Upload,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Folder,
  Building,
  User,
  X,
  Code2,
  FileCode2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderKanban,
  Files,
  ShieldAlert,
  Home,
  Lock,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { usePermission } from "@/app/hooks/usePermission";
import { API_URL } from "@/app/config/api";
import VariableGuideModal from "./components/VariableGuideModal";
import TemplateUploadModal from "./components/TemplateUploadModal";
import GenerateContractModal, { BackendTemplate } from "./components/GenerateContractModal";
import { createSampleContractDocx } from "./utils/sampleTemplateDocx";
import { downloadFile, fixVietnameseEncoding } from "./utils/contractGenerator";

interface ContractItem {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  category: "labor" | "probation" | "economic" | "service";
  partyB: string;
  partyBType: "employee" | "partner";
  employeeName?: string;
  templateName?: string;
  salary?: number;
  startDate?: string;
  endDate?: string;
  signDate?: string;
  fileUrl?: string;
  objectKey?: string;
  size?: string;
  fileSize?: string;
  updatedAt?: string;
  createdAt?: string;
  status: "active" | "pending_signature" | "draft" | "expired";
  author: string;
}

export default function ContractsPage() {
  const { showToast, employees, company, currentUser, isAuthLoaded } = useApp();
  const { can } = usePermission();

  const canViewContracts = can("contracts.view");
  const canManageContracts = can("contracts.manage");

  // 2 CHÍNH: 1 tab hiển thị Biểu mẫu, 1 tab hiển thị Hợp đồng đã làm
  const [activeTab, setActiveTab] = useState<"templates" | "contracts">("templates");

  // Real Database States (Không dùng Mock Data)
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState<boolean>(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(true);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isVariableModalOpen, setIsVariableModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [selectedTemplateToCreate, setSelectedTemplateToCreate] = useState<BackendTemplate | null>(null);

  // Delete Confirm Modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "contract" | "template";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load contracts from Backend MongoDB
  const loadContracts = async () => {
    setIsLoadingContracts(true);
    try {
      const res = await fetch(`${API_URL}/contracts`);
      if (res.ok) {
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách hợp đồng:", e);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Load templates from Backend MongoDB
  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/contracts/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách biểu mẫu:", e);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadContracts();
    loadTemplates();
  }, []);

  // Filtered contracts (chỉ tìm kiếm bằng tên / từ khóa)
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const q = searchQuery.toLowerCase();
    return contracts.filter((c) => {
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchCode = (c.code || "").toLowerCase().includes(q);
      const matchPartyB = (c.partyB || c.employeeName || "").toLowerCase().includes(q);
      const matchAuthor = (c.author || "").toLowerCase().includes(q);
      return matchTitle || matchCode || matchPartyB || matchAuthor;
    });
  }, [contracts, searchQuery]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // Folders statistics
  const folders = useMemo(() => {
    return [
      { id: "all", label: "Tất cả hợp đồng", count: contracts.length, sub: "Văn bản hợp đồng & cam kết" },
      { id: "labor", label: "Hợp đồng Lao động", count: contracts.filter((c) => c.category === "labor").length, sub: "Cán bộ nhân viên chính thức" },
      { id: "probation", label: "Hợp đồng Thử việc", count: contracts.filter((c) => c.category === "probation").length, sub: "Nhân sự mới nhận việc" },
      { id: "economic", label: "Hợp đồng Kinh tế & Dịch vụ", count: contracts.filter((c) => c.category === "economic" || c.category === "service").length, sub: "Đối tác & Nhà cung cấp" },
    ];
  }, [contracts]);

  // Tải file Word mẫu chuẩn có sẵn tất cả các trường {{...}}
  const handleDownloadSampleTemplate = () => {
    const blob = createSampleContractDocx();
    downloadFile(blob, "Mau_Hop_Dong_Lao_Dong_Co_The_Bien.docx");
    showToast("Đã tải xuống file Word mẫu chuẩn 'Mau_Hop_Dong_Lao_Dong_Co_The_Bien.docx'!");
  };

  // Mở modal tạo hợp đồng từ template cụ thể
  const handleStartCreateFromTemplate = (tpl: BackendTemplate) => {
    setSelectedTemplateToCreate(tpl);
    setIsGenerateModalOpen(true);
  };

  // Xác nhận xóa Template hoặc Contract
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      const { type, id, title } = deleteConfirmTarget;
      const endpoint =
        type === "contract"
          ? `${API_URL}/contracts/${id}`
          : `${API_URL}/contracts/templates/${id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Không thể xóa mục này khỏi máy chủ!");
      }

      showToast(`Đã xóa thành công "${title}" khỏi hệ thống và MinIO!`);
      if (type === "contract") {
        await loadContracts();
      } else {
        await loadTemplates();
      }
      setDeleteConfirmTarget(null);
    } catch (err: any) {
      showToast(err?.message || "Lỗi khi xóa!");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStatusBadge = (status: ContractItem["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-emerald-800 bg-emerald-100 border border-emerald-200">
            Hiệu lực
          </span>
        );
      case "pending_signature":
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-amber-800 bg-amber-100 border border-amber-200">
            Chờ ký
          </span>
        );
      case "draft":
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200">
            Bản nháp
          </span>
        );
      case "expired":
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-rose-800 bg-rose-100 border border-rose-200">
            Hết hạn
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200">
            {status || "Mới"}
          </span>
        );
    }
  };

  // Bảo vệ đường dẫn: Chỉ Quản trị viên (ADMIN) và Phòng HCNS mới có quyền truy cập
  if (isAuthLoaded && !canViewContracts) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Giới hạn quyền truy cập
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Khu vực <b>Công cụ tạo hợp đồng</b> chỉ dành riêng cho <b>Quản trị viên (ADMIN)</b> và <b>Phòng Hành chính Nhân sự (HCNS)</b> nhằm bảo vệ bí mật dữ liệu hợp đồng lao động và pháp lý của doanh nghiệp.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium text-left">
            <div>
              Tài khoản: <b className="text-slate-900">{currentUser?.name || "Chưa xác định"}</b>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Vai trò hệ thống: <span className="text-slate-700 font-semibold">{currentUser?.role || "USER"}</span>
            </div>
            {currentUser?.department && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                Đơn vị: <span className="text-slate-700 font-medium">{currentUser.department}</span>
              </div>
            )}
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold transition-all shadow-md shadow-[#1b365d]/20"
            >
              <Home className="w-4 h-4" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full max-w-[1600px] mx-auto relative">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSignature className="w-6 h-6 text-[#1b365d]" />
            Công cụ tạo hợp đồng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Quản lý biểu mẫu Word (.docx), sinh hợp đồng tự động cho nhân sự và lưu trữ trên MinIO S3
          </p>
        </div>

        {/* NÚT HÀNH ĐỘNG HEADER */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút 1: Hướng dẫn & Biến mẫu Word */}
          <button
            type="button"
            onClick={() => setIsVariableModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#1b365d] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Xem danh mục toàn bộ thẻ {{...}} có thể dùng trong file Word"
          >
            <Code2 className="w-4 h-4 text-[#1b365d] stroke-[2.5]" />
            <span>Hướng dẫn & Biến mẫu Word</span>
          </button>

          {/* Nút 2: Tải lên mẫu mới (Chỉ Admin & HCNS) */}
          {canManageContracts && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
              title="Tải lên tệp Word mẫu .docx mới lưu trữ vào MinIO"
            >
              <Upload className="w-4 h-4 text-slate-500 stroke-[2.5]" />
              <span>Tải lên mẫu mới (.docx)</span>
            </button>
          )}

          {/* Nút 3: Tải file Word mẫu chuẩn */}
          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            title="Tải file Word mẫu chuẩn có chứa sẵn toàn bộ các trường thẻ {{...}}"
          >
            <Download className="w-4 h-4 text-slate-500 stroke-[2.5]" />
            <span>Tải mẫu Word chuẩn</span>
          </button>

          {/* Nút 4: Tạo hợp đồng mới (Chỉ Admin & HCNS) */}
          {canManageContracts && (
            <button
              type="button"
              onClick={() => {
                setSelectedTemplateToCreate(null);
                setIsGenerateModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo hợp đồng mới</span>
            </button>
          )}
        </div>
      </div>

      {/* CHUYỂN ĐỔI 2 TAB CHÍNH: TAB MẪU BIỂU TRƯỚC, TAB HỢP ĐỒNG ĐÃ LÀM SAU */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {/* TAB 1: KHO MẪU BIỂU WORD (Ở TRƯỚC) */}
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "templates"
              ? "bg-white text-[#1b365d] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Kho mẫu biểu Word (.docx)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${activeTab === "templates"
                ? "bg-blue-100 text-[#1b365d]"
                : "bg-slate-200 text-slate-600"
                }`}
            >
              {templates.length}
            </span>
          </button>

          {/* TAB 2: HỢP ĐỒNG ĐÃ TẠO (Ở SAU) */}
          <button
            type="button"
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "contracts"
              ? "bg-white text-[#1b365d] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Files className="w-4 h-4" />
            <span>Hợp đồng đã tạo</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${activeTab === "contracts"
                ? "bg-blue-100 text-[#1b365d]"
                : "bg-slate-200 text-slate-600"
                }`}
            >
              {contracts.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            loadContracts();
            loadTemplates();
            showToast("Đang làm mới dữ liệu từ máy chủ...");
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DANH SÁCH HỢP ĐỒNG ĐÃ TẠO                                                  */}
      {/* ========================================================================= */}
      {activeTab === "contracts" && (
        <div className="space-y-4 animate-fade-in">
          {/* BẢNG DANH SÁCH HỢP ĐỒNG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header & Search Bar (Chỉ tìm kiếm theo tên/từ khóa, không cần card tab lọc) */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Danh sách hợp đồng nhân sự</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hiển thị ({filteredContracts.length} / {contracts.length} hợp đồng)
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hợp đồng theo mã số, tên hợp đồng, nhân sự..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[130px]">Mã số HĐ</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Tên văn bản hợp đồng</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Người lao động (Bên B)</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Mức lương</th>
                    <th className="py-3.5 px-3 text-center min-w-[110px]">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">Ngày ký</th>
                    <th className="py-3.5 px-4 text-center min-w-[140px]">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingContracts ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 text-[#1b365d] animate-spin" />
                          <span className="text-xs font-semibold text-slate-600">
                            Đang tải danh sách hợp đồng từ cơ sở dữ liệu...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <FileText className="w-10 h-10 text-slate-300" />
                          <span className="text-sm font-bold text-slate-700">
                            Chưa có hợp đồng nào được tạo
                          </span>
                          <p className="text-xs text-slate-400">
                            Bấm nút <strong>"Tạo hợp đồng mới"</strong> ở góc phải để chọn nhân viên và sinh hợp đồng tự động từ file Word.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="mt-2 px-4 py-2 rounded-xl bg-[#1b365d] text-white text-xs font-bold hover:bg-[#152a4a] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tạo hợp đồng đầu tiên</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((c) => {
                      const contractId = c._id || c.id || "";
                      return (
                        <tr key={contractId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Mã số HĐ */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-[#1b365d] bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-200/80">
                              {c.code}
                            </span>
                          </td>

                          {/* Tên hợp đồng */}
                          <td className="py-4 px-4 max-w-md">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{c.title}</h4>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              {c.fileSize || "45 KB"} • {c.templateName || "Mẫu chuẩn"}
                            </span>
                          </td>

                          {/* Bên B */}
                          <td className="py-4 px-4 text-slate-800 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              {c.partyBType === "employee" ? (
                                <User className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <Building className="w-4 h-4 text-purple-600 shrink-0" />
                              )}
                              <span>{c.partyB || c.employeeName}</span>
                            </div>
                          </td>

                          {/* Mức lương */}
                          <td className="py-4 px-4 text-emerald-800 font-mono font-bold text-xs">
                            {c.salary ? `${c.salary.toLocaleString("vi-VN")} đ` : "Theo thỏa thuận"}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4 px-3 text-center">
                            {renderStatusBadge(c.status)}
                          </td>

                          {/* Ngày ký */}
                          <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap font-mono">
                            {c.signDate || c.updatedAt || c.createdAt?.split("T")[0] || "23/09/2026"}
                          </td>

                          {/* Hành động */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Tải tệp từ MinIO hoặc xuất file */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (c.fileUrl) {
                                    window.open(c.fileUrl, "_blank");
                                  } else {
                                    const blob = createSampleContractDocx();
                                    downloadFile(blob, `${c.code}_${(c.partyB || "NhanVien").replace(/\s+/g, "_")}.docx`);
                                  }
                                  showToast(`Đang tải tệp hợp đồng ${c.code}...`);
                                }}
                                className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                                title="Tải tệp Word (.docx)"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* NÚT XÓA HỢP ĐỒNG (Chỉ Admin & HCNS) */}
                              {canManageContracts && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirmTarget({
                                      type: "contract",
                                      id: contractId,
                                      title: c.code,
                                    })
                                  }
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                                  title="Xóa hợp đồng này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KHO MẪU BIỂU WORD (.DOCX) LƯU TRÊN MINIO S3                       */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6 animate-fade-in">
          {/* TOP ACTIONS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kho Biểu Mẫu Hợp Đồng (.docx)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Các tệp Word mẫu đã được gắn thẻ biến {"{{...}}"} lưu trữ trực tiếp trên MinIO S3
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input for Templates */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu hợp đồng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mẫu Word chuẩn</span>
              </button>

              {/* Nút upload mẫu mới (Chỉ Admin & HCNS) */}
              {canManageContracts && (
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải lên mẫu mới (.docx)</span>
                </button>
              )}
            </div>
          </div>

          {/* TEMPLATES GRID */}
          {isLoadingTemplates ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 text-[#1b365d] animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Đang nạp kho mẫu từ MinIO...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <FileCode2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Kho mẫu biểu đang trống</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hãy tải lên các file Word mẫu (.docx) của công ty bạn để bắt đầu sinh hợp đồng tự động.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Tải file mẫu chuẩn về tham khảo
                </button>
                {canManageContracts && (
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#1b365d] text-white text-xs font-bold hover:bg-[#152a4a] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải lên mẫu Word đầu tiên</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tpl) => {
                const tplId = tpl._id || tpl.id || "";
                return (
                  <div
                    key={tplId}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d]">
                          <FileCode2 className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          {tpl.category === "probation"
                            ? "Thử việc"
                            : tpl.category === "economic"
                              ? "Kinh tế"
                              : tpl.category === "service"
                                ? "Dịch vụ"
                                : "Lao động chính thức"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#1b365d] transition-colors line-clamp-2">
                        {fixVietnameseEncoding(tpl.name)}
                      </h4>
                      {tpl.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal">
                          {tpl.description}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="truncate max-w-[160px]">{tpl.fileName}</span>
                        <span>{tpl.fileSize || "40 KB"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        {/* Tải file mẫu từ MinIO */}
                        {tpl.fileUrl && (
                          <a
                            href={tpl.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 border border-slate-200 transition-all"
                            title="Tải file mẫu về máy"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* NÚT XÓA MẪU (Chỉ Admin & HCNS) */}
                        {canManageContracts && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: "template",
                                id: tplId,
                                title: tpl.name,
                              })
                            }
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            title="Xóa mẫu biểu này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dùng mẫu này để tạo hợp đồng (Chỉ Admin & HCNS) */}
                      {canManageContracts && (
                        <button
                          type="button"
                          onClick={() => handleStartCreateFromTemplate(tpl)}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <span>Dùng mẫu này</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL HƯỚNG DẪN & DANH MỤC BIẾN MẪU WORD                                */}
      {/* ========================================================================= */}
      <VariableGuideModal
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
        onDownloadSampleTemplate={handleDownloadSampleTemplate}
        showToast={showToast}
      />

      {/* ========================================================================= */}
      {/* 2. MODAL TẢI LÊN MẪU BIỂU MỚI (.DOCX) LÊN MINIO                           */}
      {/* ========================================================================= */}
      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadTemplates}
        onDownloadSampleTemplate={handleDownloadSampleTemplate}
        showToast={showToast}
      />

      {/* ========================================================================= */}
      {/* 3. MODAL SINH HỢP ĐỒNG TỰ ĐỘNG CÓ TÍNH NĂNG XEM TRƯỚC                     */}
      {/* ========================================================================= */}
      <GenerateContractModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        templates={templates}
        employees={employees}
        company={company}
        preselectedTemplate={selectedTemplateToCreate}
        onSuccess={loadContracts}
        showToast={showToast}
      />

      {/* ========================================================================= */}
      {/* 4. MODAL XÁC NHẬN XÓA (CONFIRM DELETE)                                    */}
      {/* ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {deleteConfirmTarget.type === "contract" ? "Xác nhận xóa hợp đồng" : "Xác nhận xóa biểu mẫu"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xóa <strong>"{deleteConfirmTarget.title}"</strong>? Tệp tin tương ứng trên MinIO và bản ghi cơ sở dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
