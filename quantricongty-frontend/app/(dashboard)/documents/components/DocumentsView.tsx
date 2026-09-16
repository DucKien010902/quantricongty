"use client";

import React, { useState, useMemo } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Search,
  Eye,
  FileSpreadsheet,
  Folder,
  Plus,
  Filter,
  FileCode,
  Archive,
  Info,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import DocumentTypeIcon from "@/app/components/ui/DocumentTypeIcon";

interface DocItem {
  id: string;
  title: string;
  category: "rules" | "contracts" | "forms" | "finance";
  type: "PDF" | "XLSX" | "DOCX" | "PPTX" | "ZIP";
  size: string;
  updatedAt: string;
  author: string;
}

export default function DocumentsView() {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const docs: DocItem[] = useMemo(
    () => [
      {
        id: "1",
        title: "Quy chế làm việc & Văn hóa ứng xử doanh nghiệp 2026",
        category: "rules",
        type: "PDF",
        size: "2.4 MB",
        updatedAt: "10/09/2026",
        author: "Ban Pháp Chế",
      },
      {
        id: "2",
        title: "Chính sách Bảo mật dữ liệu & An toàn thông tin số",
        category: "rules",
        type: "PDF",
        size: "1.8 MB",
        updatedAt: "08/09/2026",
        author: "Ban CNTT & Chuyển đổi số",
      },
      {
        id: "3",
        title: "Mẫu đơn xin nghỉ phép & Đề xuất công tác 2026",
        category: "forms",
        type: "DOCX",
        size: "150 KB",
        updatedAt: "01/09/2026",
        author: "Ban Nhân Sự",
      },
      {
        id: "4",
        title: "Mẫu Hợp đồng lao động chính thức chuẩn",
        category: "contracts",
        type: "DOCX",
        size: "320 KB",
        updatedAt: "15/08/2026",
        author: "Ban Pháp Chế",
      },
      {
        id: "5",
        title: "Biểu mẫu Đánh giá năng lực cán bộ định kỳ Q3",
        category: "forms",
        type: "XLSX",
        size: "450 KB",
        updatedAt: "12/08/2026",
        author: "Ban Nhân Sự",
      },
      {
        id: "6",
        title: "Báo cáo Tổng hợp Ngân sách & Dự toán Q3-2026",
        category: "finance",
        type: "XLSX",
        size: "1.2 MB",
        updatedAt: "05/08/2026",
        author: "Ban Tài Chính Kế Toán",
      },
      {
        id: "7",
        title: "Slide Giới thiệu Công ty & Định hướng chiến lược 2026",
        category: "rules",
        type: "PPTX",
        size: "5.6 MB",
        updatedAt: "20/07/2026",
        author: "Ban Tổng Giám Đốc",
      },
      {
        id: "8",
        title: "Bộ biểu mẫu Tuyển dụng & Hướng dẫn Onboarding",
        category: "forms",
        type: "ZIP",
        size: "8.9 MB",
        updatedAt: "10/07/2026",
        author: "Ban Nhân Sự",
      },
    ],
    []
  );

  const folders = useMemo(() => {
    return [
      { id: "all", label: "Tất cả tài liệu", count: docs.length, color: "blue" },
      { id: "rules", label: "Quy chế & Nội quy", count: docs.filter((d) => d.category === "rules").length, color: "emerald" },
      { id: "contracts", label: "Hợp đồng & Pháp lý", count: docs.filter((d) => d.category === "contracts").length, color: "amber" },
      { id: "forms", label: "Biểu mẫu Nhân sự", count: docs.filter((d) => d.category === "forms").length, color: "purple" },
    ];
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (selectedFolder !== "all" && d.category !== selectedFolder) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchAuthor = d.author.toLowerCase().includes(q);
        const matchType = d.type.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchType) return false;
      }
      return true;
    });
  }, [docs, selectedFolder, searchQuery]);

  // Helper render file type icon chuẩn SVG chính thức
  const renderFileTypeBadge = (type: string) => {
    return <DocumentTypeIcon type={type} size="md" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-[#1b365d]" />
            Kho tài liệu doanh nghiệp
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Lưu trữ, tra cứu quy chế, biểu mẫu và văn bản hành chính lưu hành nội bộ
          </p>
        </div>

        <button
          onClick={() => showToast("Tính năng tải lên tài liệu mới sẽ hoàn thiện vào phiên bản tiếp theo!")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Tải lên tài liệu</span>
        </button>
      </div>

      {/* THỦ MỤC PHÂN LOẠI (4 THẺ TO RÕ, ĐẸP MẮT) */}
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
                  {f.count} file
                </span>
              </div>
              <div className="mt-4">
                <p className="text-base font-bold text-slate-900 leading-snug">{f.label}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Văn bản lưu hành nội bộ</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* BỘ LỌC TÌM KIẾM VÀ BẢNG TÀI LIỆU */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter & Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách văn bản & tài liệu</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hiển thị ({filteredDocs.length} tài liệu)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, ban hành, định dạng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>

            {/* Folder Dropdown */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full sm:w-auto text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
            >
              <option value="all">Tất cả danh mục ({docs.length})</option>
              <option value="rules">Quy chế & Nội quy</option>
              <option value="contracts">Hợp đồng & Pháp lý</option>
              <option value="forms">Biểu mẫu Nhân sự</option>
              <option value="finance">Tài chính & Ngân sách</option>
            </select>
          </div>
        </div>

        {/* Document Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 min-w-[130px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tên văn bản & Tài liệu</th>
                <th className="py-3.5 px-4 min-w-[160px]">Đơn vị ban hành</th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">Dung lượng</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Ngày cập nhật</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileText className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-sm font-semibold text-slate-600">Không tìm thấy tài liệu nào</span>
                      <span className="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Định dạng */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderFileTypeBadge(doc.type)}
                    </td>

                    {/* Tên văn bản */}
                    <td className="py-4 px-4 max-w-md">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h4>
                    </td>

                    {/* Đơn vị ban hành */}
                    <td className="py-4 px-4 text-slate-700 text-xs font-semibold">
                      {doc.author}
                    </td>

                    {/* Dung lượng */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-slate-700 bg-slate-100">
                        {doc.size}
                      </span>
                    </td>

                    {/* Ngày cập nhật */}
                    <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap">
                      {doc.updatedAt}
                    </td>

                    {/* Hành động */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => showToast(`Đang mở xem trực tuyến: ${doc.title}`)}
                          className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                          title="Xem trực tuyến"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => showToast(`Tải file về máy: ${doc.title}`)}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
                          title="Tải về máy"
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
    </div>
  );
}

