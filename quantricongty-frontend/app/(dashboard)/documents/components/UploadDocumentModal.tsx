"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { API_URL } from "@/app/config/api";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  showToast,
}: UploadDocumentModalProps) {
  const [docTitle, setDocTitle] = useState("");
  const [category, setCategory] = useState<string>("rules");
  const [author, setAuthor] = useState("Ban Giám Đốc");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadError(null);
      setSelectedFile(file);
      if (!docTitle) {
        // Tự động điền tên không gồm phần mở rộng
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Vui lòng chọn tệp tài liệu cần tải lên!");
      showToast("Vui lòng chọn tệp tài liệu cần tải lên!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", docTitle.trim());
      formData.append("category", category);
      formData.append("author", author.trim());
      formData.append("description", description.trim());

      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Lỗi khi tải tài liệu lên máy chủ!";
        if (res.status === 413) {
          errorMsg = "Lỗi 413 (Payload Too Large): Dung lượng tệp vượt quá giới hạn cho phép của Máy chủ Nginx (Vui lòng chọn tệp nhỏ hơn hoặc tăng client_max_body_size trên Nginx).";
        } else if (res.status === 500) {
          errorMsg = "Lỗi 500: Máy chủ gặp sự cố xử lý tệp tài liệu!";
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

      showToast(`Đã tải lên và lưu trữ văn bản "${docTitle.trim() || selectedFile.name}" vào MinIO S3 thành công!`);
      onSuccess();
      onClose();

      // Reset form
      setDocTitle("");
      setDescription("");
      setSelectedFile(null);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      const msg = err?.message || "Không thể tải lên tài liệu. Vui lòng thử lại!";
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
              <h3 className="text-base sm:text-lg font-bold">Tải Lên Tài Liệu & Văn Bản Mới</h3>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Lưu trữ tệp thực tế lên hệ thống MinIO S3 và quản lý cơ sở dữ liệu nội bộ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* BANNER HIỂN THỊ LỖI NẾU CÓ */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Không thể tải tệp lên máy chủ:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed font-medium">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Chọn File upload */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 text-xs flex items-center justify-between">
              <span>Chọn tệp văn bản / tài liệu từ máy tính: <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">Hỗ trợ PDF, Word, Excel, PowerPoint, Zip, Image</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 text-emerald-800">
                  <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-bold text-sm truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-emerald-600 font-mono">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Click để đổi tệp khác
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1b365d] flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">Nhấn vào đây để tải tệp lên</p>
                    <p className="text-slate-400 text-xs mt-0.5">Dung lượng tối đa khuyến nghị: 50MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tên văn bản */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 text-xs">
              Tên văn bản & Tài liệu: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quy chế làm việc & Văn hóa ứng xử 2026..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
            />
          </div>

          {/* Phân loại & Đơn vị ban hành */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 text-xs">Danh mục tài liệu:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              >
                <option value="rules">Quy chế & Nội quy doanh nghiệp</option>
                <option value="contracts">Hợp đồng & Văn bản pháp lý</option>
                <option value="forms">Biểu mẫu Nhân sự & Đơn từ</option>
                <option value="finance">Báo cáo & Tài chính Kế toán</option>
                <option value="other">Tài liệu tham khảo khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 text-xs">Đơn vị / Ban hành:</label>
              <input
                type="text"
                placeholder="VD: Ban Pháp Chế, Ban Nhân Sự..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          </div>

          {/* Ghi chú / Mô tả */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 text-xs">Mô tả tóm tắt nội dung văn bản:</label>
            <textarea
              rows={2}
              placeholder="Nhập mô tả tóm tắt nếu có..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tải lên MinIO...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Xác nhận Tải lên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
