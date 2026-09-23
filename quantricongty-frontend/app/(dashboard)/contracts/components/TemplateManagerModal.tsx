"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  FileCode2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";

export interface DocxTemplateItem {
  id: string;
  name: string;
  category: "labor" | "probation" | "economic" | "service";
  categoryLabel: string;
  fileName: string;
  fileSize: string;
  updatedAt: string;
  isSystemDefault?: boolean;
  fileBuffer?: ArrayBuffer;
}

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DocxTemplateItem[];
  onUploadTemplate: (newTemplate: DocxTemplateItem) => void;
  onDeleteTemplate: (id: string) => void;
  onSelectTemplateToCreate: (template: DocxTemplateItem) => void;
  onDownloadSampleTemplate: () => void;
  showToast: (msg: string) => void;
}

export default function TemplateManagerModal({
  isOpen,
  onClose,
  templates,
  onUploadTemplate,
  onDeleteTemplate,
  onSelectTemplateToCreate,
  onDownloadSampleTemplate,
  showToast,
}: TemplateManagerModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState<"labor" | "probation" | "economic" | "service">("labor");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".docx")) {
        showToast("Vui lòng chỉ chọn tệp Word định dạng .docx!");
        return;
      }
      setSelectedFile(file);
      if (!templateName) {
        setTemplateName(file.name.replace(".docx", ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Vui lòng chọn tệp Word (.docx) mẫu!");
      return;
    }
    if (!templateName.trim()) {
      showToast("Vui lòng nhập tên biểu mẫu hợp đồng!");
      return;
    }

    setIsUploading(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const categoryLabels = {
        labor: "Hợp đồng lao động",
        probation: "Hợp đồng thử việc",
        economic: "Hợp đồng kinh tế",
        service: "Hợp đồng dịch vụ",
      };

      const newTemplate: DocxTemplateItem = {
        id: `tpl-${Date.now()}`,
        name: templateName.trim(),
        category,
        categoryLabel: categoryLabels[category],
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024).toFixed(0)} KB`,
        updatedAt: new Date().toLocaleDateString("vi-VN"),
        isSystemDefault: false,
        fileBuffer: buffer,
      };

      onUploadTemplate(newTemplate);
      showToast(`Đã thêm mẫu hợp đồng "${newTemplate.name}" thành công!`);

      // Reset form
      setTemplateName("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      showToast("Lỗi khi đọc file Word mẫu. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" hideHeader className="p-0 overflow-hidden">
      <div className="flex flex-col h-[85vh] max-h-[750px] bg-slate-50 overflow-hidden">
        {/* HEADER */}
        <div className="p-5 px-6 bg-[#1b365d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-blue-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Quản Lý Kho Mẫu Hợp Đồng (.docx)</h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Tải lên biểu mẫu Word có chứa thẻ {"{{...}}"} để sinh hợp đồng tự động
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* UPLOAD FORM CARD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1b365d]" />
                Tải lên biểu mẫu Word mới
              </h4>
              <button
                type="button"
                onClick={onDownloadSampleTemplate}
                className="text-xs text-[#1b365d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải mẫu file Word chuẩn (.docx)
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên biểu mẫu hợp đồng (*)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: HĐLĐ Chính thức 12 tháng - 2026..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phân loại hợp đồng
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] cursor-pointer"
                  >
                    <option value="labor">Hợp đồng lao động chính thức</option>
                    <option value="probation">Hợp đồng thử việc</option>
                    <option value="economic">Hợp đồng kinh tế</option>
                    <option value="service">Hợp đồng dịch vụ</option>
                  </select>
                </div>
              </div>

              {/* File selector dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn tệp Word (.docx) (*)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#1b365d] bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-4 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <FileText className="w-7 h-7 text-slate-400 group-hover:text-[#1b365d] transition-colors" />
                    {selectedFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-emerald-700 block">{selectedFile.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {(selectedFile.size / 1024).toFixed(0)} KB • Bấm để chọn lại
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <span className="font-bold text-slate-700 group-hover:text-[#1b365d]">
                          Nhấn vào đây để tải tệp Word (.docx) từ máy tính
                        </span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Hỗ trợ định dạng Microsoft Word .docx có chứa các biến dạng {"{{employee.fullName}}"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Đang xử lý..." : "Lưu vào kho biểu mẫu"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* TEMPLATES LIST */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Danh sách biểu mẫu đã lưu ({templates.length})</span>
              <span className="text-xs font-normal text-slate-500">
                Có thể dùng ngay để sinh hợp đồng cho từng nhân viên
              </span>
            </h4>

            <div className="space-y-2.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d] shrink-0 mt-0.5">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-slate-900">{tpl.name}</h5>
                        {tpl.isSystemDefault && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Mẫu chuẩn hệ thống
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                          {tpl.categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                        <span>Tệp: <strong className="text-slate-600 font-mono">{tpl.fileName}</strong></span>
                        <span>•</span>
                        <span>Dung lượng: {tpl.fileSize}</span>
                        <span>•</span>
                        <span>Cập nhật: {tpl.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onSelectTemplateToCreate(tpl)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Tạo hợp đồng</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {!tpl.isSystemDefault && (
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa mẫu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
