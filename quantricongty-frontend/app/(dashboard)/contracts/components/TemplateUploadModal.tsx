"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, Download, AlertCircle } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { API_URL } from "@/app/config/api";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDownloadSampleTemplate: () => void;
  showToast: (msg: string) => void;
}

export default function TemplateUploadModal({
  isOpen,
  onClose,
  onSuccess,
  onDownloadSampleTemplate,
  showToast,
}: TemplateUploadModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState<"labor" | "probation" | "economic" | "service">("labor");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".docx")) {
        showToast("Vui lòng chỉ chọn tệp Word định dạng .docx!");
        return;
      }
      setUploadError(null);
      setSelectedFile(file);
      if (!templateName) {
        setTemplateName(file.name.replace(".docx", ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Vui lòng chọn tệp Word (.docx) mẫu!");
      showToast("Vui lòng chọn tệp Word (.docx) mẫu!");
      return;
    }
    if (!templateName.trim()) {
      setUploadError("Vui lòng nhập tên biểu mẫu hợp đồng!");
      showToast("Vui lòng nhập tên biểu mẫu hợp đồng!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", templateName.trim());
      formData.append("category", category);
      formData.append("description", description.trim());

      const res = await fetch(`${API_URL}/contracts/templates/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Lỗi khi tải mẫu lên máy chủ!";
        if (res.status === 413) {
          errorMsg = "Lỗi 413 (Payload Too Large): Dung lượng tệp vượt quá giới hạn cho phép của Máy chủ Nginx (Vui lòng chọn tệp nhỏ hơn hoặc tăng client_max_body_size trên Nginx).";
        } else if (res.status === 500) {
          errorMsg = "Lỗi 500: Máy chủ gặp sự cố xử lý tệp Word mẫu!";
        } else {
          try {
            const err = await res.json();
            errorMsg = err.message || errorMsg;
          } catch {
            const text = await res.text().catch(() => "");
            if (text.includes("413") || text.includes("Too Large")) {
              errorMsg = "Lỗi 413: Dung lượng tệp vượt quá giới hạn Nginx Server!";
            }
          }
        }
        throw new Error(errorMsg);
      }

      showToast(`Đã tải lên và lưu trữ biểu mẫu "${templateName.trim()}" vào MinIO thành công!`);
      onSuccess();
      onClose();

      // Reset form
      setTemplateName("");
      setDescription("");
      setSelectedFile(null);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      const msg = err?.message || "Không thể tải lên biểu mẫu. Vui lòng thử lại!";
      setUploadError(msg);
      showToast(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" hideHeader className="p-0 overflow-hidden">
      <div className="flex flex-col bg-slate-50 overflow-hidden">
        {/* HEADER */}
        <div className="p-5 px-6 bg-[#1b365d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-blue-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Tải Lên Biểu Mẫu Hợp Đồng (.docx)</h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Tệp Word sẽ được lưu trữ an toàn trên MinIO S3 Object Storage
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

        {/* FORM */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* BANNER LỖI NẾU CÓ */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Không thể tải mẫu lên máy chủ:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed font-medium">{uploadError}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-semibold text-slate-600">
              Định dạng hỗ trợ: Microsoft Word (.docx) chứa thẻ {"{{...}}"}
            </span>
            <button
              type="button"
              onClick={onDownloadSampleTemplate}
              className="text-[#1b365d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Tải file Word mẫu chuẩn
            </button>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Tên biểu mẫu hợp đồng (*)
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Hợp đồng lao động xác định thời hạn 12 tháng..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Phân loại hợp đồng (*)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] cursor-pointer"
              >
                <option value="labor">Hợp đồng lao động chính thức</option>
                <option value="probation">Hợp đồng thử việc</option>
                <option value="economic">Hợp đồng kinh tế</option>
                <option value="service">Hợp đồng dịch vụ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mô tả biểu mẫu (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Áp dụng cho khối văn phòng và kỹ thuật..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          </div>

          {/* File selector dropzone */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Chọn tệp Word (.docx) mẫu (*)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#1b365d] bg-white hover:bg-blue-50/20 rounded-xl p-5 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-[#1b365d] transition-colors" />
                {selectedFile ? (
                  <div>
                    <span className="font-bold text-emerald-700 block text-sm">
                      {selectedFile.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Bấm để chọn lại
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-slate-700 group-hover:text-[#1b365d] block">
                      Nhấp vào đây để chọn tệp Word (.docx) từ máy tính
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      File mẫu có chứa các thẻ biến như {"{{employee.fullName}}"}, {"{{contract.salary}}"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] disabled:bg-slate-300 text-white font-bold shadow-md shadow-[#1b365d]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "Đang tải lên MinIO..." : "Tải lên & Lưu mẫu"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
