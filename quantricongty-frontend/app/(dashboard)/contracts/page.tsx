"use client";

import React, { useState, useMemo } from "react";
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
  Edit,
  Folder,
  Building,
  User,
  X,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import Modal from "@/app/components/ui/Modal";

interface ContractItem {
  id: string;
  code: string;
  title: string;
  category: "labor" | "probation" | "economic" | "service";
  partyB: string;
  partyBType: "employee" | "partner";
  size: string;
  updatedAt: string;
  status: "active" | "pending_signature" | "draft" | "expired";
  author: string;
}

export default function ContractsPage() {
  const { showToast } = useApp();
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"labor" | "probation" | "economic" | "service">("labor");
  const [newPartyB, setNewPartyB] = useState("");
  const [newAuthor, setNewAuthor] = useState("Ban Pháp Chế");

  const contracts: ContractItem[] = useMemo(
    () => [
      {
        id: "cnt-001",
        code: "HĐLĐ-2026/001",
        title: "Hợp đồng lao động không xác định thời hạn (Ban Giám Đốc)",
        category: "labor",
        partyB: "Nguyễn Đức Kiên",
        partyBType: "employee",
        size: "450 KB",
        updatedAt: "10/09/2026",
        status: "active",
        author: "Ban Pháp Chế",
      },
      {
        id: "cnt-002",
        code: "HĐTV-2026/014",
        title: "Hợp đồng thử việc 02 tháng - Chuyên viên Thiết kế UI/UX",
        category: "probation",
        partyB: "Lê Phương Thảo",
        partyBType: "employee",
        size: "320 KB",
        updatedAt: "05/09/2026",
        status: "active",
        author: "Ban Nhân Sự",
      },
      {
        id: "cnt-003",
        code: "HĐKT-2026/089",
        title: "Hợp đồng kinh tế cung cấp giải pháp bản quyền phần mềm ERP",
        category: "economic",
        partyB: "Công ty Cổ phần SmartSoft",
        partyBType: "partner",
        size: "1.5 MB",
        updatedAt: "01/09/2026",
        status: "pending_signature",
        author: "Ban CNTT & Chuyển đổi số",
      },
      {
        id: "cnt-004",
        code: "HĐDV-2026/045",
        title: "Hợp đồng dịch vụ tư vấn chiến lược Chuyển đổi số & AI",
        category: "service",
        partyB: "Viện Nghiên cứu & Ứng dụng Trí tuệ Nhân tạo",
        partyBType: "partner",
        size: "890 KB",
        updatedAt: "28/08/2026",
        status: "draft",
        author: "Ban Chiến Lược",
      },
      {
        id: "cnt-005",
        code: "HĐLĐ-2026/018",
        title: "Hợp đồng lao động xác định thời hạn 12 tháng",
        category: "labor",
        partyB: "Trần Minh Quang",
        partyBType: "employee",
        size: "410 KB",
        updatedAt: "15/08/2026",
        status: "active",
        author: "Ban Nhân Sự",
      },
    ],
    []
  );

  const folders = useMemo(() => {
    return [
      { id: "all", label: "Tất cả hợp đồng", count: contracts.length, sub: "Văn bản hợp đồng & cam kết" },
      { id: "labor", label: "Hợp đồng Lao động", count: contracts.filter((c) => c.category === "labor").length, sub: "Cán bộ nhân viên chính thức" },
      { id: "probation", label: "Hợp đồng Thử việc", count: contracts.filter((c) => c.category === "probation").length, sub: "Nhân sự mới nhận việc" },
      { id: "economic", label: "Hợp đồng Kinh tế & Dịch vụ", count: contracts.filter((c) => c.category === "economic" || c.category === "service").length, sub: "Đối tác & Nhà cung cấp" },
    ];
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (selectedFolder !== "all") {
        if (selectedFolder === "economic") {
          if (c.category !== "economic" && c.category !== "service") return false;
        } else if (c.category !== selectedFolder) {
          return false;
        }
      }

      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchCode = c.code.toLowerCase().includes(q);
        const matchPartyB = c.partyB.toLowerCase().includes(q);
        const matchAuthor = c.author.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchPartyB && !matchAuthor) return false;
      }

      return true;
    });
  }, [contracts, selectedFolder, statusFilter, searchQuery]);

  const handleDownloadTemplate = () => {
    showToast("Đang tải tệp biểu mẫu Hợp đồng lao động & Hợp đồng dịch vụ (.docx)...");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPartyB.trim()) {
      showToast("Vui lòng nhập tên hợp đồng và đối tác/nhân sự!");
      return;
    }
    showToast(`Đã lưu bản nháp hợp đồng "${newTitle.trim()}"!`);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewPartyB("");
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
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto relative">
      {/* HEADER BANNER - TƯƠNG ĐỒNG KHÔI TÀI LIỆU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSignature className="w-6 h-6 text-[#1b365d]" />
            Công cụ tạo hợp đồng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Soạn thảo, sinh hợp đồng tự động, quản lý ký kết và lưu trữ hợp đồng doanh nghiệp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500 stroke-[2.5]" />
            <span>Tải mẫu hợp đồng</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo hợp đồng mới</span>
          </button>
        </div>
      </div>

      {/* THỦ MỤC PHÂN LOẠI (4 THẺ TO RÕ, CHUẨN CỠ CHỮ & CẤU TRÚC NHƯ KHO TÀI LIỆU) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map((f) => {
          const isSelected = selectedFolder === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-[#1b365d] ring-2 ring-[#1b365d]/20 shadow-md"
                  : "bg-white border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-50 text-[#1b365d]" : "bg-slate-100 text-slate-600"}`}>
                  <Folder className="w-5 h-5" />
                </div>
                <span className="text-sm font-extrabold font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                  {f.count} hợp đồng
                </span>
              </div>
              <div className="mt-4">
                <p className="text-base font-bold text-slate-900 leading-snug">{f.label}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{f.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* BỘ LỌC TÌM KIẾM VÀ BẢNG HỢP ĐỒNG */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter & Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách hợp đồng & văn bản ký kết</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hiển thị ({filteredContracts.length} hợp đồng)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã số, tiêu đề, bên B..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
            >
              <option value="all">Tất cả trạng thái ({contracts.length})</option>
              <option value="active">Đang hiệu lực</option>
              <option value="pending_signature">Chờ ký kết</option>
              <option value="draft">Bản nháp</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>

        {/* Contract Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 min-w-[130px]">Mã số HĐ</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tên văn bản hợp đồng</th>
                <th className="py-3.5 px-4 min-w-[180px]">Bên B (Ký kết)</th>
                <th className="py-3.5 px-4 min-w-[150px]">Đơn vị quản lý</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">Trạng thái</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Ngày tạo</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileText className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-sm font-semibold text-slate-600">Không tìm thấy hợp đồng nào</span>
                      <span className="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã số HĐ */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#1b365d] bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-200/80">
                        {c.code}
                      </span>
                    </td>

                    {/* Tên hợp đồng */}
                    <td className="py-4 px-4 max-w-md">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{c.title}</h4>
                    </td>

                    {/* Bên B */}
                    <td className="py-4 px-4 text-slate-800 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        {c.partyBType === "employee" ? (
                          <User className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Building className="w-4 h-4 text-purple-600 shrink-0" />
                        )}
                        <span>{c.partyB}</span>
                      </div>
                    </td>

                    {/* Đơn vị quản lý */}
                    <td className="py-4 px-4 text-slate-700 text-xs font-semibold">
                      {c.author}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-3 text-center">
                      {renderStatusBadge(c.status)}
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap font-mono">
                      {c.updatedAt}
                    </td>

                    {/* Hành động */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => showToast(`Xem chi tiết hợp đồng: ${c.code}`)}
                          className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                          title="Xem trực tuyến"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => showToast(`Đang tải tệp hợp đồng ${c.code}...`)}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                          title="Tải tệp hợp đồng"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Hợp Đồng Mới */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          size="lg"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-100 bg-[#1b365d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-200" />
                <h3 className="text-base font-bold">Tạo Hợp Đồng Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tên văn bản hợp đồng (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hợp đồng lao động xác định thời hạn 12 tháng..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1b365d] text-slate-800 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Phân loại hợp đồng (*)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1b365d] text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value="labor">Hợp đồng lao động</option>
                    <option value="probation">Hợp đồng thử việc</option>
                    <option value="economic">Hợp đồng kinh tế</option>
                    <option value="service">Hợp đồng dịch vụ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Ban / Phòng phụ trách
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1b365d] text-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bên B (Nhân sự hoặc Công ty đối tác) (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A hoặc Công ty TNHH SmartSoft..."
                  value={newPartyB}
                  onChange={(e) => setNewPartyB(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#1b365d] text-slate-800 text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-bold shadow-md shadow-[#1b365d]/20 transition-all cursor-pointer text-xs"
                >
                  Lưu bản nháp
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
